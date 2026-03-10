from engine import scan_stock
import json

test_stocks = ["RELIANCE.NS", "TCS.NS", "IDEA.NS"]

for s in test_stocks:
    res = scan_stock(s)
    print(f"{s}: {json.dumps(res, indent=2)}")
