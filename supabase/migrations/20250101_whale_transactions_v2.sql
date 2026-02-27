-- Migration: whale_transactions v2 — add new columns & enable Realtime
-- Run this in Supabase SQL Editor or via the Supabase CLI

-- 1. Add new columns (safe: IF NOT EXISTS via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'whale_transactions'
      AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE public.whale_transactions
      ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'transfer';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'whale_transactions'
      AND column_name = 'from_owner'
  ) THEN
    ALTER TABLE public.whale_transactions ADD COLUMN from_owner TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'whale_transactions'
      AND column_name = 'to_owner'
  ) THEN
    ALTER TABLE public.whale_transactions ADD COLUMN to_owner TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'whale_transactions'
      AND column_name = 'alert_text'
  ) THEN
    ALTER TABLE public.whale_transactions ADD COLUMN alert_text TEXT;
  END IF;
END $$;

-- 2. Add index on transaction_type for filter queries
CREATE INDEX IF NOT EXISTS idx_whale_tx_type
  ON public.whale_transactions (transaction_type);

-- 3. Update the alerts_feed view to use new columns
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
      WHEN amount_range ILIKE '%$1,000,001%' OR amount_range ILIKE '%$5,000,001%'
        OR amount_range ILIKE '%$25,000,001%' OR amount_range ILIKE '%$50,000,001%' THEN 'critical'
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
    COALESCE(from_owner, from_owner_type, 'Unknown') || ' → ' || COALESCE(to_owner, to_owner_type, 'Unknown') AS actor,
    symbol,
    COALESCE(transaction_type, 'transfer') AS action,
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

-- 4. Enable Supabase Realtime on whale_transactions
--    Allows the browser client to receive live INSERT events via postgres_changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.whale_transactions;
