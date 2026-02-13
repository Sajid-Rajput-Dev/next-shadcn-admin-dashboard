-- Capitol Alpha MVP Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. user_preferences
-- ============================================================
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    default_market TEXT NOT NULL DEFAULT 'all' CHECK (
        default_market IN ('stocks', 'crypto', 'all')
    ),
    alert_email BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences" ON public.user_preferences FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR
UPDATE USING (auth.uid () = user_id);

-- Auto-create preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. congress_trades
-- ============================================================
CREATE TABLE public.congress_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  politician_name TEXT NOT NULL,
  politician_party TEXT,
  politician_chamber TEXT CHECK (politician_chamber IN ('Senate', 'House')),
  politician_state TEXT,
  ticker TEXT NOT NULL,
  company_name TEXT,
  transaction_type TEXT NOT NULL,
  amount_range TEXT,
  transaction_date DATE NOT NULL,
  disclosure_date DATE NOT NULL,
  sector TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

-- Prevent duplicate entries
UNIQUE(politician_name, ticker, transaction_date, transaction_type, amount_range)
);

-- RLS: all authenticated users can read
ALTER TABLE public.congress_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read congress_trades" ON public.congress_trades FOR
SELECT TO authenticated USING (true);

-- Indexes for common query patterns
CREATE INDEX idx_congress_trades_ticker ON public.congress_trades (ticker);

CREATE INDEX idx_congress_trades_politician ON public.congress_trades (politician_name);

CREATE INDEX idx_congress_trades_date ON public.congress_trades (transaction_date DESC);

CREATE INDEX idx_congress_trades_disclosure ON public.congress_trades (disclosure_date DESC);

CREATE INDEX idx_congress_trades_party ON public.congress_trades (politician_party);

-- ============================================================
-- 3. whale_transactions
-- ============================================================
CREATE TABLE public.whale_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    blockchain TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    symbol TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    amount_usd NUMERIC NOT NULL,
    from_owner_type TEXT,
    to_owner_type TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tx_hash, blockchain)
);

ALTER TABLE public.whale_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read whale_transactions" ON public.whale_transactions FOR
SELECT TO authenticated USING (true);

CREATE INDEX idx_whale_tx_symbol ON public.whale_transactions (symbol);

CREATE INDEX idx_whale_tx_timestamp ON public.whale_transactions (timestamp DESC);

CREATE INDEX idx_whale_tx_amount ON public.whale_transactions (amount_usd DESC);

CREATE INDEX idx_whale_tx_blockchain ON public.whale_transactions (blockchain);

-- ============================================================
-- 4. watchlist_items
-- ============================================================
CREATE TABLE public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (
        asset_type IN ('stock', 'crypto')
    ),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, ticker, asset_type)
);

ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own watchlist" ON public.watchlist_items FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can add to watchlist" ON public.watchlist_items FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can remove from watchlist" ON public.watchlist_items FOR DELETE USING (auth.uid () = user_id);

CREATE INDEX idx_watchlist_user ON public.watchlist_items (user_id);

-- ============================================================
-- 5. alerts_feed (unified view)
-- ============================================================

CREATE OR REPLACE VIEW public.alerts_feed AS
  -- Congress trade alerts
  SELECT
    id::TEXT,
    'congress' AS source,
    politician_name AS actor,
    ticker AS symbol,
    transaction_type AS action,
    COALESCE(amount_range, 'N/A') AS amount_display,
    disclosure_date::TIMESTAMPTZ AS event_time,
    CASE
      WHEN amount_range ILIKE '%$1,000,001%' OR amount_range ILIKE '%$5,000,001%' OR amount_range ILIKE '%$25,000,001%' OR amount_range ILIKE '%$50,000,001%' THEN 'critical'
      WHEN amount_range ILIKE '%$250,001%' OR amount_range ILIKE '%$500,001%' THEN 'high'
      WHEN amount_range ILIKE '%$50,001%' OR amount_range ILIKE '%$100,001%' THEN 'medium'
      ELSE 'low'
    END AS severity
  FROM public.congress_trades

  UNION ALL

-- Whale transaction alerts
SELECT
    id::TEXT,
    'whale' AS source,
    COALESCE(from_owner_type, 'Unknown') || ' → ' || COALESCE(to_owner_type, 'Unknown') AS actor,
    symbol,
    CASE
      WHEN to_owner_type = 'exchange' THEN 'Exchange Deposit'
      WHEN from_owner_type = 'exchange' THEN 'Exchange Withdrawal'
      ELSE 'Transfer'
    END AS action,
    '$' || TRIM(TO_CHAR(amount_usd, '999,999,999,999')) AS amount_display,
    timestamp AS event_time,
    CASE
      WHEN amount_usd >= 50000000 THEN 'critical'
      WHEN amount_usd >= 10000000 THEN 'high'
      WHEN amount_usd >= 1000000 THEN 'medium'
      ELSE 'low'
    END AS severity
  FROM public.whale_transactions

  ORDER BY event_time DESC;