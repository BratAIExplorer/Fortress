#!/usr/bin/env python3
"""
Telegram Export Parser — Parse HTML exports from Telegram Desktop
Extracts trading recommendations and normalizes to database schema

Usage:
  python parse_telegram_exports.py \
    --spoton "/path/to/ChatExport_SpotOn/messages.html" \
    --deepak "/path/to/ChatExport_Deepak/messages.html" \
    --output "/output/parsed_calls.json"
"""

import re
import json
import sys
import html
from typing import Optional, Dict, List, Any
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict
import argparse
import glob

@dataclass
class TelegramCall:
    """Normalized trading call record"""
    source: str  # "SpotOnTradingTips" | "deepakstockvipo"
    symbol: str  # Normalized: "HDFC", "AAPL"
    market: str  # "NSE" | "US"
    entry_price: float
    entry_date: str  # ISO format
    targets: List[float]  # [288, 301, 310]
    stop_loss: float
    timeframe: Optional[str] = None  # "SWING" | "DAY" | "POSITIONAL"
    rationale_type: Optional[str] = None
    rationale_text: Optional[str] = None
    raw_text: Optional[str] = None  # Original message for audit

class TelegramParser:
    """Parse Telegram HTML exports"""

    def __init__(self, source_name: str):
        self.source_name = source_name
        self.calls: List[TelegramCall] = []
        self.audit = {
            "source": source_name,
            "total_messages": 0,
            "calls_parsed": 0,
            "calls_failed": 0,
            "failure_reasons": {},
        }

    def parse_html_file(self, filepath: str) -> None:
        """Parse a single HTML export file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract all messages: <div class="message default clearfix" ...> ... </div>
        # Find start of each message, then extract until closing </div> at proper level
        message_starts = [(m.start(), m.group(0)) for m in re.finditer(r'<div class="message default clearfix"[^>]*>', content)]

        messages = []
        for i, (start, opener) in enumerate(message_starts):
            # Find the next message start, or end of history
            if i + 1 < len(message_starts):
                end = message_starts[i + 1][0]
            else:
                end = content.find('</div>\n   </div>\n  </div>', start)

            if end > start:
                msg_content = content[start:end]
                messages.append(msg_content)

        self.audit["total_messages"] = len(messages)

        for msg in messages:
            try:
                call = self._extract_call_from_message(msg)
                if call:
                    self.calls.append(call)
                    self.audit["calls_parsed"] += 1
            except Exception as e:
                self.audit["calls_failed"] += 1
                reason = str(e)
                self.audit["failure_reasons"][reason] = self.audit["failure_reasons"].get(reason, 0) + 1

    def _extract_call_from_message(self, msg: str) -> Optional[TelegramCall]:
        """Extract a single trading call from message HTML"""

        # Extract timestamp from title attribute
        date_match = re.search(r'title="([^"]+)"', msg)
        if not date_match:
            raise ValueError("No timestamp found")

        # Parse date string like "04.09.2024 01:35:57 UTC+08:00"
        date_str_raw = date_match.group(1)
        try:
            # Extract just the date and time part
            date_str = date_str_raw.split(' UTC')[0]
            entry_date = datetime.strptime(date_str, "%d.%m.%Y %H:%M:%S").isoformat()
        except:
            raise ValueError(f"Invalid date format: {date_str_raw}")


        # Extract message text (clean HTML)
        text_match = re.search(r'<div class="text">(.*?)</div>', msg, re.DOTALL)
        if not text_match:
            raise ValueError("No text content")

        raw_text = text_match.group(1)
        # Decode HTML entities and clean
        text = html.unescape(raw_text).replace('<br>', '\n').replace('<br/>', '\n')
        text = re.sub(r'<[^>]+>', '', text)  # Remove remaining HTML tags

        # Skip non-trading messages
        if not self._is_trading_call(text):
            raise ValueError("Not a trading call")

        # Parse the recommendation
        call = self._parse_call_text(text, entry_date, self.source_name)
        if not call:
            raise ValueError("Failed to parse call text")

        call.raw_text = raw_text[:500]  # Store first 500 chars for audit
        return call

    def _is_trading_call(self, text: str) -> bool:
        """Check if message is a trading recommendation"""
        trading_keywords = [
            'cmp', 'target', 'entry', 'buy', 'sell', 'sl ', 'stock',
            'symbol', 'level', 'support', 'resistance', 'break'
        ]
        return any(kw in text.lower() for kw in trading_keywords)

    def _parse_call_text(self, text: str, entry_date: str, source: str) -> Optional[TelegramCall]:
        """Parse trading call from normalized text"""

        lines = text.strip().split('\n')

        # First line often has the symbol
        symbol = self._extract_symbol(lines[0] if lines else "")
        if not symbol:
            raise ValueError("No symbol found")

        # Full text for pattern matching
        full_text = '\n'.join(lines).lower()

        # Extract CMP/Entry Price (try multiple patterns)
        entry_price = None

        # Pattern 1: "cmp : 255" or "CMP 255"
        cmp_match = re.search(r'cmp[:\s]+(\d+(?:\.\d+)?)', full_text)
        if cmp_match:
            entry_price = float(cmp_match.group(1))

        # Pattern 2: "Entry : 255" or "entry at 255"
        if not entry_price:
            entry_match = re.search(r'entr(?:y|ies)[:\s]+(?:at\s+)?(\d+(?:\.\d+)?)', full_text)
            if entry_match:
                entry_price = float(entry_match.group(1))

        # Pattern 3: Look for a price near "Buy" recommendation
        if not entry_price:
            buy_match = re.search(r'buy[:\s]+(?:at\s+)?(\d+(?:\.\d+)?)', full_text)
            if buy_match:
                entry_price = float(buy_match.group(1))

        if not entry_price:
            raise ValueError("No CMP found")

        # Extract Target(s)
        targets = self._extract_targets(full_text)
        if not targets:
            raise ValueError("No targets found")

        # Extract Stop Loss (try multiple patterns)
        stop_loss = None

        # Pattern 1: "SL : 244" or "SL 244"
        sl_match = re.search(r'(?:stop\s+loss|sl)[:\s]+(\d+(?:\.\d+)?)', full_text)
        if sl_match:
            stop_loss = float(sl_match.group(1))

        # Pattern 2: "stoploss at 244"
        if not stop_loss:
            stoploss_match = re.search(r'stoploss[:\s]+(?:at\s+)?(\d+(?:\.\d+)?)', full_text)
            if stoploss_match:
                stop_loss = float(stoploss_match.group(1))

        # Pattern 3: Look for "Keep a stop loss of X"
        if not stop_loss:
            keep_sl = re.search(r'(?:keep|place)[^.]*?(?:stop\s+loss|sl)[:\s]+(?:of\s+)?(\d+(?:\.\d+)?)', full_text)
            if keep_sl:
                stop_loss = float(keep_sl.group(1))

        if not stop_loss:
            raise ValueError("No SL found")

        # Determine market based on symbol
        market = self._detect_market(symbol, entry_price)

        # Extract timeframe if present
        timeframe = self._extract_timeframe(text)

        return TelegramCall(
            source=source,
            symbol=symbol,
            market=market,
            entry_price=entry_price,
            entry_date=entry_date,
            targets=targets,
            stop_loss=stop_loss,
            timeframe=timeframe,
        )

    def _extract_symbol(self, text: str) -> Optional[str]:
        """Extract stock symbol from text"""
        text_stripped = text.strip()

        # Remove common prefixes/patterns
        text_clean = re.sub(r'^(stock|symbol|ticker)[:\s]*', '', text_stripped, flags=re.IGNORECASE)

        # Also check for patterns like "Stock: HDFC" or just "HDFC<br>"
        lines = text_clean.split('\n')

        for line in lines:
            line = line.strip()
            # Skip empty or very short lines
            if not line or len(line) < 2:
                continue

            # Pattern 1: "SYMBOL Name Description" - extract first word if all caps
            first_word = line.split()[0] if line.split() else ""
            if first_word and len(first_word) >= 1 and first_word.isupper():
                # Remove common non-symbol suffixes
                if not any(x in first_word.lower() for x in ['and', 'the', 'for', 'with']):
                    return first_word

            # Pattern 2: Look for company name patterns (first capitalized word(s))
            matches = re.findall(r'\b([A-Z][A-Za-z0-9]*(?:\s+[A-Z][A-Za-z0-9]*)?)\b', line)
            if matches:
                # Return the longest match that looks like a symbol (1-20 chars, mostly letters/numbers)
                for match in matches:
                    clean_match = match.replace(' ', '')
                    if 1 <= len(clean_match) <= 20 and re.match(r'^[A-Z][A-Z0-9]{0,19}$', clean_match):
                        return clean_match

        return None

    def _extract_targets(self, text: str) -> List[float]:
        """Extract target prices (can be multiple)"""
        targets = []
        text_lower = text.lower()

        # Pattern 1: "target(s) : 288 / 301 / 310"
        target_line_match = re.search(r'target[s]?[:\s]*([0-9\s/,\.&]+)', text_lower)
        if target_line_match:
            target_str = target_line_match.group(1)
            # Extract all numbers from this section
            numbers = re.findall(r'(\d+(?:\.\d+)?)', target_str)
            targets.extend([float(n) for n in numbers])

        # Pattern 2: "288/301/310" format
        if not targets:
            slash_match = re.search(r'(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)\s*(?:/\s*(\d+(?:\.\d+)?))?', text)
            if slash_match:
                targets = [float(g) for g in slash_match.groups() if g]

        # Pattern 3: Multiple occurrences of "target X"
        if not targets:
            all_target_matches = re.findall(r'(\d+(?:\.\d+)?)\s*(?:target|level)', text_lower)
            targets.extend([float(m) for m in all_target_matches])

        # Pattern 4: Just look for high numbers that could be targets (between entry and reasonable upside)
        if not targets:
            # This is a fallback - look for any significant number
            all_numbers = re.findall(r'(\d+(?:\.\d+)?)', text)
            # Filter to reasonable targets (numbers greater than first occurrence)
            if len(all_numbers) >= 2:
                targets = [float(n) for n in all_numbers[1:3]]  # Take 2nd and 3rd numbers as potential targets

        return sorted(list(set(targets)))  # Unique, sorted

    def _extract_timeframe(self, text: str) -> Optional[str]:
        """Detect timeframe (Swing, Day, Positional)"""
        text_lower = text.lower()

        if 'swing' in text_lower:
            return "SWING"
        elif 'day' in text_lower and 'trade' in text_lower:
            return "DAY"
        elif 'positional' in text_lower or 'long term' in text_lower:
            return "POSITIONAL"

        return None

    def _detect_market(self, symbol: str, price: float) -> str:
        """Detect if NSE or US based on symbol and price"""
        # Simple heuristic: NSE stocks typically > 50, US typically < 500
        # NSE tickers are usually 3-4 chars, US are 1-5 chars

        # NSE-specific tickers (hardcoded for accuracy)
        nse_tickers = {
            'hdfc', 'icici', 'sbi', 'infy', 'tcs', 'wipro', 'reliance', 'jio',
            'axis', 'kotak', 'nifty', 'sensex', 'irfc', 'cdsl', 'ireda', 'bepl',
            'nbcc', 'lloyds', 'sail', 'jktyre', 'marine', 'man industries',
            'bajaj', 'dixo', 'waaree', 'engg', 'finserv', 'housing'
        }

        symbol_lower = symbol.lower()
        if any(nse in symbol_lower for nse in nse_tickers):
            return "NSE"

        # Default to US if not recognized
        return "US"

    def get_audit_log(self) -> Dict[str, Any]:
        """Return audit log"""
        return self.audit

def main():
    parser = argparse.ArgumentParser(description="Parse Telegram HTML exports")
    parser.add_argument("--spoton", required=True, help="Path to SpotOnTradingTips export folder")
    parser.add_argument("--deepak", required=True, help="Path to deepakstockvipo export folder")
    parser.add_argument("--output", required=True, help="Output JSON file")

    args = parser.parse_args()

    all_calls = []
    all_audits = []

    # Parse SpotOnTradingTips
    print("[*] Parsing SpotOnTradingTips export...")
    spoton_parser = TelegramParser("SpotOnTradingTips")
    spoton_files = glob.glob(f"{args.spoton}/**/messages*.html", recursive=True)
    for file in spoton_files:
        print(f"    Reading {file}...")
        spoton_parser.parse_html_file(file)
    all_calls.extend(spoton_parser.calls)
    all_audits.append(spoton_parser.get_audit_log())
    print(f"    -> Parsed {spoton_parser.audit['calls_parsed']} calls")

    # Parse deepakstockvipo
    print("[*] Parsing deepakstockvipo export...")
    deepak_parser = TelegramParser("deepakstockvipo")
    deepak_files = glob.glob(f"{args.deepak}/**/messages*.html", recursive=True)
    for file in deepak_files:
        print(f"    Reading {file}...")
        deepak_parser.parse_html_file(file)
    all_calls.extend(deepak_parser.calls)
    all_audits.append(deepak_parser.get_audit_log())
    print(f"    -> Parsed {deepak_parser.audit['calls_parsed']} calls")

    # Save output
    output_data = {
        "calls": [asdict(call) for call in all_calls],
        "audits": all_audits,
        "summary": {
            "total_calls": len(all_calls),
            "by_source": {
                "SpotOnTradingTips": len([c for c in all_calls if c.source == "SpotOnTradingTips"]),
                "deepakstockvipo": len([c for c in all_calls if c.source == "deepakstockvipo"]),
            },
            "by_market": {
                "NSE": len([c for c in all_calls if c.market == "NSE"]),
                "US": len([c for c in all_calls if c.market == "US"]),
            },
            "generated_at": datetime.now().isoformat(),
        }
    }

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)

    print(f"\n[OK] Parsing complete!")
    print(f"  Total calls: {len(all_calls)}")
    print(f"  SpotOnTradingTips: {output_data['summary']['by_source']['SpotOnTradingTips']}")
    print(f"  deepakstockvipo: {output_data['summary']['by_source']['deepakstockvipo']}")
    print(f"  NSE: {output_data['summary']['by_market']['NSE']}")
    print(f"  US: {output_data['summary']['by_market']['US']}")
    print(f"  Output: {args.output}")

    # Print audit summary
    for audit in all_audits:
        print(f"\n[AUDIT] {audit['source']}:")
        print(f"   Messages read: {audit['total_messages']}")
        print(f"   Calls parsed: {audit['calls_parsed']}")
        print(f"   Failed: {audit['calls_failed']}")
        if audit['failure_reasons']:
            print(f"   Failure reasons: {audit['failure_reasons']}")

if __name__ == "__main__":
    main()
