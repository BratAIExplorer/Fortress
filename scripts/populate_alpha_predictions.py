"""
Run immediately after a scan completes.
Takes all stocks scoring >= 60 from the latest completed scan
and inserts them into alpha_predictions with entry price + benchmark level.
"""
import sys
import os
sys.path.insert(0, '/opt/fortress')

import yfinance as yf
import psycopg2
from datetime import datetime, timezone

DB = "dbname=fortress user=postgres host=/var/run/postgresql"

def get_nifty_level():
    try:
        nifty = yf.Ticker("^NSEI")
        hist = nifty.history(period="1d")
        if not hist.empty:
            return float(hist['Close'].iloc[-1])
    except Exception as e:
        print(f"Warning: Could not fetch Nifty level: {e}")
    return None

def run():
    conn = psycopg2.connect(DB)
    cur = conn.cursor()

    # Get latest completed scan
    cur.execute("""
        SELECT id FROM scans
        WHERE status = 'COMPLETED'
        ORDER BY run_at DESC LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        print("No completed scan found.")
        return
    scan_id = row[0]
    print(f"Using scan: {scan_id}")

    # Check already populated
    cur.execute("SELECT COUNT(*) FROM alpha_predictions WHERE scan_result_id IN "
                "(SELECT id FROM scan_results WHERE scan_id = %s)", (scan_id,))
    already = cur.fetchone()[0]
    if already > 0:
        print(f"Already populated {already} entries for this scan. Skipping.")
        return

    # Get benchmark level
    benchmark_entry = get_nifty_level()
    if benchmark_entry is None:
        print("ERROR: Cannot get Nifty level. Aborting — benchmark_entry is required.")
        return
    print(f"Nifty 50 benchmark level: {benchmark_entry}")

    # Fetch qualifying results (score >= 60)
    cur.execute("""
        SELECT id, symbol, market, price_at_scan, total_score,
               l1_pass::int + l2_pass::int + l3_pass::int + l4_pass::int + l5_pass::int,
               cc_score, mb_score, megatrend_tag
        FROM scan_results
        WHERE scan_id = %s
          AND total_score >= 60
          AND price_at_scan IS NOT NULL
          AND price_at_scan > 0
    """, (scan_id,))
    results = cur.fetchall()
    print(f"Stocks scoring >= 60: {len(results)}")

    inserted = 0
    for row in results:
        scan_result_id, symbol, market, entry_price, total_score, \
        l1_score, cc_score, mb_score, megatrend_tag = row

        cur.execute("""
            INSERT INTO alpha_predictions
            (scan_result_id, symbol, market, entry_price, benchmark_entry,
             total_score, l1_score, cc_score, mb_score, megatrend_tag)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (scan_result_id, symbol, market, entry_price, benchmark_entry,
              total_score, l1_score, cc_score, mb_score, megatrend_tag))
        inserted += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"Done. {inserted} predictions recorded with benchmark at {benchmark_entry}")

if __name__ == "__main__":
    run()
