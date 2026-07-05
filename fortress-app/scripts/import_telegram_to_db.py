#!/usr/bin/env python3
"""
Import parsed Telegram calls into PostgreSQL database

Usage:
  DATABASE_URL="postgresql://..." python import_telegram_to_db.py --input /tmp/telegram_calls.json
"""

import json
import sys
import os
import argparse
from datetime import datetime
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values

def clean_symbol(symbol: str) -> str:
    """Remove emojis and special characters from symbol"""
    # Remove common emoji patterns
    symbol = symbol.replace('💥', '').replace('🔥', '').replace('🎯', '')
    symbol = symbol.replace('📊', '').replace('🚀', '').replace('✅', '')
    symbol = symbol.replace('⭐', '').replace('⚡', '').replace('📈', '')

    # Remove numbers and non-letter characters except common ones
    import re
    symbol = re.sub(r'[^A-Z0-9]', '', symbol)

    # If symbol is now just 1-2 chars, it might be wrong - filter common false positives
    if len(symbol) <= 2:
        return None

    return symbol if symbol else None

def import_calls(db_url: str, calls_file: str) -> None:
    """Import calls from JSON into database"""

    # Load calls from JSON
    with open(calls_file, 'r') as f:
        data = json.load(f)

    calls = data['calls']
    print(f"[*] Loading {len(calls)} calls from {calls_file}")

    # Connect to database
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print(f"[OK] Connected to PostgreSQL")
    except Exception as e:
        print(f"[ERROR] Failed to connect: {e}")
        sys.exit(1)

    # Prepare insert data
    inserts = []
    skipped = 0
    inserted = 0

    for call in calls:
        # Clean symbol
        symbol = clean_symbol(call['symbol'])
        if not symbol:
            skipped += 1
            continue

        # Prepare row
        row = (
            call['source'],
            symbol,
            call['market'],
            float(call['entry_price']),
            call['entry_date'],
            json.dumps(call['targets']),  # JSONB
            float(call['stop_loss']),
            call.get('timeframe'),
            call.get('rationale_type'),
            call.get('rationale_text'),
            'OPEN',  # status
            None,  # exit_price
            None,  # exit_date
            None,  # return_pct
            None,  # entry_bh_price
            None,  # bh_return_pct
            None,  # risk_reward_ratio
            None,  # max_drawdown_pct
        )
        inserts.append(row)
        inserted += 1

    # Batch insert
    if inserts:
        sql = """
        INSERT INTO telegram_calls (
            source, symbol, market, entry_price, entry_date, targets, stop_loss,
            timeframe, rationale_type, rationale_text, status,
            exit_price, exit_date, return_pct, entry_bh_price, bh_return_pct,
            risk_reward_ratio, max_drawdown_pct
        ) VALUES %s
        """

        try:
            execute_values(cursor, sql, inserts, page_size=100)
            conn.commit()
            print(f"[OK] Inserted {len(inserts)} calls into telegram_calls")
        except Exception as e:
            conn.rollback()
            print(f"[ERROR] Failed to insert: {e}")
            sys.exit(1)

    print(f"[SUMMARY] Processed: {len(calls)}, Inserted: {inserted}, Skipped: {skipped}")

    # Insert audit log
    try:
        audit_sql = """
        INSERT INTO telegram_validation_audit (
            export_file, parse_status, total_messages_read,
            calls_parsed, calls_failed, failure_reasons, validation_notes
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        audits = data['audits']
        audit_rows = [
            (
                audit['source'],
                'PARTIAL',  # parse_status
                audit['total_messages'],
                audit['calls_parsed'],
                audit['calls_failed'],
                json.dumps(audit['failure_reasons']),  # JSONB
                f"Initial parse of {audit['source']} export"
            )
            for audit in audits
        ]

        for row in audit_rows:
            cursor.execute(audit_sql, row)
        conn.commit()
        print(f"[OK] Inserted {len(audit_rows)} audit logs")
    except Exception as e:
        print(f"[WARNING] Failed to insert audit log: {e}")

    cursor.close()
    conn.close()

def main():
    parser = argparse.ArgumentParser(description="Import Telegram calls to PostgreSQL")
    parser.add_argument("--input", required=True, help="Input JSON file from parser")

    args = parser.parse_args()

    # Get database URL from environment
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[ERROR] DATABASE_URL environment variable not set")
        sys.exit(1)

    import_calls(db_url, args.input)

if __name__ == "__main__":
    main()
