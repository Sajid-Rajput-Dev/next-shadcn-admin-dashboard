import type { Database } from "./database";

/** Database row type */
export type WatchlistItemRow = Database["public"]["Tables"]["watchlist_items"]["Row"];

/** Watchlist item for UI display */
export interface WatchlistItem extends WatchlistItemRow {
    // Add computed fields if any, for now it's just the row
    currentPrice?: number;
    priceChange?: number;
}
