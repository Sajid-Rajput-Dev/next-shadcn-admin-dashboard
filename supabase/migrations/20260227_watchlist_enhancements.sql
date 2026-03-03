-- ============================================================
-- Watchlist Enhancements Migration
-- Adds: name column (if not exists), display_order column,
--       UPDATE RLS policy for reordering
-- ============================================================

-- name column (may already exist in some environments)
ALTER TABLE public.watchlist_items
    ADD COLUMN IF NOT EXISTS name TEXT;

-- display_order for drag-and-drop reordering
ALTER TABLE public.watchlist_items
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- UPDATE policy (needed for reordering and name edits)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'watchlist_items'
          AND policyname = 'Users can update own watchlist'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update own watchlist"
            ON public.watchlist_items
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id)';
    END IF;
END $$;

-- Index for display_order queries
CREATE INDEX IF NOT EXISTS idx_watchlist_user_order
    ON public.watchlist_items (user_id, display_order);
