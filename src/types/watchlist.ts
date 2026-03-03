import type { Database } from "./database";

/** Raw database row */
export type WatchlistItemRow = Database["public"]["Tables"]["watchlist_items"]["Row"];

/** Watchlist item enriched with live market data and intelligence signals */
export interface WatchlistItem extends WatchlistItemRow {
  // Live price data (populated by /api/watchlist/enriched)
  currentPrice: number | null;
  changePercent: number | null;
  change: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  marketCap: number | null;
  displayName: string | null;
  // Capitol Alpha intelligence enrichment
  congressTradeCount: number;
  whaleActivityCount: number;
}

/** Result from ticker search (/api/stocks/search) */
export interface TickerSearchResult {
  ticker: string;
  name: string;
  asset_type: "stock" | "crypto";
  exchange?: string;
  coinId?: string; // CoinGecko ID for crypto assets
}

/** Payload for adding to watchlist */
export interface AddToWatchlistPayload {
  ticker: string;
  asset_type: "stock" | "crypto";
  name: string;
  coinId?: string;
}
