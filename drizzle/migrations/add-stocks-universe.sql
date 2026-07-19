-- Create stocks_universe table (master registry for scanner universe)
CREATE TABLE IF NOT EXISTS stocks_universe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    market TEXT NOT NULL,
    cap_tier TEXT,
    sector TEXT,
    source TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups by symbol/market and market/active
CREATE INDEX IF NOT EXISTS idx_universe_symbol_market ON stocks_universe(symbol, market);
CREATE INDEX IF NOT EXISTS idx_universe_market_active ON stocks_universe(market, is_active);

-- Seed S&P 500 mega/large caps (top 30)
INSERT INTO stocks_universe (symbol, market, cap_tier, source) VALUES
('AAPL', 'US', 'mega', 'SP500'),
('MSFT', 'US', 'mega', 'SP500'),
('NVDA', 'US', 'mega', 'SP500'),
('GOOGL', 'US', 'mega', 'SP500'),
('AMZN', 'US', 'mega', 'SP500'),
('META', 'US', 'mega', 'SP500'),
('TSLA', 'US', 'mega', 'SP500'),
('NFLX', 'US', 'mega', 'SP500'),
('ADBE', 'US', 'mega', 'SP500'),
('CRM', 'US', 'mega', 'SP500'),
('INTC', 'US', 'large', 'SP500'),
('AMD', 'US', 'large', 'SP500'),
('QCOM', 'US', 'large', 'SP500'),
('AVGO', 'US', 'large', 'SP500'),
('MU', 'US', 'large', 'SP500'),
('COST', 'US', 'mega', 'SP500'),
('JPM', 'US', 'mega', 'SP500'),
('BAC', 'US', 'large', 'SP500'),
('WFC', 'US', 'large', 'SP500'),
('GS', 'US', 'large', 'SP500'),
('XOM', 'US', 'mega', 'SP500'),
('CVX', 'US', 'large', 'SP500'),
('MCD', 'US', 'large', 'SP500'),
('KO', 'US', 'large', 'SP500'),
('PEP', 'US', 'large', 'SP500'),
('JNJ', 'US', 'mega', 'SP500'),
('PFE', 'US', 'large', 'SP500'),
('UNH', 'US', 'mega', 'SP500'),
('CVS', 'US', 'large', 'SP500'),
('ABT', 'US', 'large', 'SP500');

-- Seed growth/momentum names (Nasdaq 100 focused)
INSERT INTO stocks_universe (symbol, market, cap_tier, source) VALUES
('DASH', 'US', 'large', 'NASDAQ100'),
('PLTR', 'US', 'large', 'NASDAQ100'),
('DDOG', 'US', 'large', 'NASDAQ100'),
('SPOT', 'US', 'large', 'NASDAQ100'),
('NU', 'US', 'large', 'NASDAQ100'),
('APP', 'US', 'mid', 'NASDAQ100'),
('SQ', 'US', 'large', 'NASDAQ100'),
('SE', 'US', 'large', 'NASDAQ100'),
('MELI', 'US', 'large', 'NASDAQ100'),
('SHOP', 'US', 'large', 'NASDAQ100'),
('SOFI', 'US', 'large', 'NASDAQ100'),
('NOW', 'US', 'large', 'NASDAQ100'),
('RDDT', 'US', 'mid', 'NASDAQ100'),
('TOST', 'US', 'mid', 'NASDAQ100'),
('PANW', 'US', 'large', 'NASDAQ100');

-- Seed NSE 50 (Nifty 50 core)
INSERT INTO stocks_universe (symbol, market, cap_tier, source) VALUES
('HDFC', 'NSE', 'mega', 'NSE50'),
('INFY', 'NSE', 'mega', 'NSE50'),
('TCS', 'NSE', 'mega', 'NSE50'),
('RELIANCE', 'NSE', 'mega', 'NSE50'),
('BAJAJFINSV', 'NSE', 'large', 'NSE50'),
('ITC', 'NSE', 'large', 'NSE50'),
('ASIANPAINT', 'NSE', 'large', 'NSE50'),
('SBIN', 'NSE', 'large', 'NSE50'),
('WIPRO', 'NSE', 'large', 'NSE50'),
('LT', 'NSE', 'large', 'NSE50'),
('MARUTI', 'NSE', 'large', 'NSE50'),
('SUNPHARMA', 'NSE', 'large', 'NSE50'),
('HCLTECH', 'NSE', 'large', 'NSE50'),
('ULTRACEMCO', 'NSE', 'large', 'NSE50'),
('TATASTEEL', 'NSE', 'large', 'NSE50');

-- Seed NSE 500 mid-caps (sample)
INSERT INTO stocks_universe (symbol, market, cap_tier, source) VALUES
('ADANIPORTS', 'NSE', 'mid', 'NSE500'),
('POWERGRID', 'NSE', 'mid', 'NSE500'),
('GAIL', 'NSE', 'mid', 'NSE500'),
('ONGC', 'NSE', 'mid', 'NSE500'),
('APOLLOHOSP', 'NSE', 'mid', 'NSE500'),
('DRREDDY', 'NSE', 'mid', 'NSE500'),
('TECHM', 'NSE', 'mid', 'NSE500'),
('MINDTREE', 'NSE', 'mid', 'NSE500'),
('NTPC', 'NSE', 'mid', 'NSE500'),
('JSWSTEEL', 'NSE', 'mid', 'NSE500');
