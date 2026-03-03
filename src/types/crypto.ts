import type { Database } from "./database";

/** Database row type */
export type WhaleTransactionRow = Database["public"]["Tables"]["whale_transactions"]["Row"];

/** Whale transaction with computed fields */
export interface WhaleTransaction extends WhaleTransactionRow {
  /** Computed: buy signal, sell signal, or transfer */
  signalType?: "Buy Signal" | "Sell Signal" | "Transfer";
  /** Computed severity based on amount_usd */
  severity?: "low" | "medium" | "high" | "critical";
}

/** CoinGecko market data for a single coin */
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

/** CoinGecko global market data */
export interface CryptoGlobalStats {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
}

/** Filters for whale transaction table */
export interface WhaleFilter {
  blockchain?: string;
  symbol?: string;
  minAmountUsd?: number;
  ownerType?: string;
  transactionType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
