import sys
sys.path.insert(0, '/opt/fortress')
import yfinance as yf
import psycopg2
from datetime import datetime, timezone, timedelta

DB = "dbname=fortress user=postgres host=/var/run/postgresql"
WINDOWS = [
    (30,  'price_30d',  'benchmark_30d',  'alpha_30d'),
    (90,  'price_90d',  'benchmark_90d',  'alpha_90d'),
    (180, 'price_180d', 'benchmark_180d', 'alpha_180d'),
    (365, 'price_1yr',  'benchmark_1yr',  'alpha_1yr'),
]

def get_price(symbol):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2d")
        if not hist.empty:
            return float(hist['Close'].iloc[-1])
    except Exception as e:
        print(f"  Price fetch failed for {symbol}: {e}")
    return None

def run():
    conn = psycopg2.connect(DB)
    cur = conn.cursor()
    now = datetime.now(timezone.utc)
    updated = 0
    nifty_now = get_price("^NSEI")
    if nifty_now is None:
        print("Cannot fetch Nifty level — aborting.")
        return
    print(f"Nifty now: {nifty_now}")
    for days, price_col, bench_col, alpha_col in WINDOWS:
        cutoff = now - timedelta(days=days)
        cur.execute(f"""
            SELECT id, symbol, entry_price, benchmark_entry
            FROM alpha_predictions
            WHERE entry_date <= %s AND {price_col} IS NULL
        """, (cutoff,))
        rows = cur.fetchall()
        if not rows:
            print(f"[{days}d] No pending outcomes.")
            continue
        print(f"[{days}d] Processing {len(rows)} predictions...")
        for pred_id, symbol, entry_price, benchmark_entry in rows:
            current_price = get_price(symbol)
            if current_price is None:
                continue
            stock_return = (current_price - float(entry_price)) / float(entry_price)
            bench_return = (nifty_now - float(benchmark_entry)) / float(benchmark_entry)
            alpha = round((stock_return - bench_return) * 100, 2)
            cur.execute(f"""
                UPDATE alpha_predictions
                SET {price_col} = %s, {bench_col} = %s, {alpha_col} = %s
                WHERE id = %s
            """, (current_price, nifty_now, alpha, pred_id))
            print(f"  {symbol}: {days}d alpha = {alpha:+.1f}pp")
            updated += 1
    conn.commit()
    cur.close()
    conn.close()
    print(f"Done. {updated} outcomes recorded.")

if __name__ == "__main__":
    print(f"=== Fortress Outcome Tracker {datetime.now().strftime('%Y-%m-%d %H:%M')} ===")
    run()
