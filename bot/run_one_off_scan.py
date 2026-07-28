import macd_excel_bot

print("Starting a one-off test scan for Nifty 500 stocks...")
print("This will download all Nifty 500 stock data, calculate crossovers for July 3rd/4th, 2026, populate the Excel sheet, and trigger Telegram alerts.")

state = macd_excel_bot.load_state()

try:
    # Run the standard scan cycle once
    macd_excel_bot.run_scan_cycle(state)
    print("\n[SUCCESS] One-off scan completed successfully!")
    
    # Load and show results
    import pandas as pd
    active_df = pd.read_excel(macd_excel_bot.EXCEL_FILE, sheet_name='Currently Active')
    print(f"\nFound {len(active_df)} stocks that met the crossover criteria:")
    if len(active_df) > 0:
        print(active_df[["Symbol", "CMP", "Crossover Date", "Days Since Crossover", "Quantity", "Invested Amount"]].to_string(index=False))
    else:
        print("No stocks met the crossover criteria on July 3rd or July 4th, 2026.")
        
except Exception as e:
    print("\n[FAIL] Error running scan:")
    import traceback
    traceback.print_exc()
