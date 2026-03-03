/** API base URLs */
export const API_URLS = {
  FMP: "https://financialmodelingprep.com/api/v3",
  FMP_V4: "https://financialmodelingprep.com/api/v4",
  FMP_STABLE: "https://financialmodelingprep.com/stable",
  COINGECKO: "https://api.coingecko.com/api/v3",
  /** Deprecated (v1) REST API — still works with Custom Alerts API key */
  WHALE_ALERT: "https://api.whale-alert.io/v1",
  /** WebSocket endpoint for Custom Alerts API plan */
  WHALE_ALERT_WS: "wss://leviathan.whale-alert.io/ws",
} as const;

/** Cache TTLs in seconds for API route responses */
export const CACHE_TTL = {
  CONGRESS_TRADES: 15 * 60, // 15 minutes
  CONGRESS_ALERTS: 5 * 60, // 5 minutes
  WHALE_TRANSACTIONS: 60, // 1 minute (reduced with paid plan)
  CRYPTO_PRICES: 60, // 1 minute
  STOCK_QUOTES: 60, // 1 minute
  HEATMAP: 5 * 60, // 5 minutes
  POLITICIANS: 30 * 60, // 30 minutes
  MARKET_MOVERS: 3 * 60, // 3 minutes — gainers/losers/actives
  NEWS: 5 * 60, // 5 minutes
  STOCK_HISTORY: 10 * 60, // 10 minutes
  INSIDER_TRADES: 10 * 60, // 10 minutes
  EARNINGS_CALENDAR: 15 * 60, // 15 minutes
  COMPANY_PROFILE: 60 * 60, // 1 hour
} as const;

/** TanStack Query stale times in milliseconds */
export const STALE_TIME = {
  CONGRESS_TRADES: 15 * 60 * 1000,
  WHALE_TRANSACTIONS: 60 * 1000, // 1 minute
  STOCK_QUOTES: 60 * 1000,
  CRYPTO_PRICES: 60 * 1000,
  ALERTS_FEED: 30 * 1000,
  HEATMAP: 5 * 60 * 1000,
  WATCHLIST: 0, // Always refetch
  POLITICIANS: 30 * 60 * 1000,
  MARKET_MOVERS: 2 * 60 * 1000, // 2 minutes
  NEWS: 5 * 60 * 1000, // 5 minutes
  STOCK_HISTORY: 10 * 60 * 1000, // 10 minutes
  INSIDER_TRADES: 10 * 60 * 1000, // 10 minutes
  EARNINGS_CALENDAR: 15 * 60 * 1000, // 15 minutes
  COMPANY_PROFILE: 60 * 60 * 1000, // 1 hour
} as const;

/** Minimum whale alert value — Custom Alerts API plan allows $100K min */
export const WHALE_MIN_VALUE_USD = 100_000;

/** Severity thresholds */
export const CONGRESS_SEVERITY_THRESHOLDS = {
  critical: "$1,000,001",
  high: "$250,001",
  medium: "$50,001",
} as const;

export const WHALE_SEVERITY_THRESHOLDS = {
  critical: 50_000_000, // $50M+
  high: 10_000_000, // $10M+
  medium: 1_000_000, // $1M+
} as const;

/** Party colors for UI badges */
export const PARTY_COLORS = {
  Democrat: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  Republican: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  Independent: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
} as const;

/** Severity colors for UI badges */
export const SEVERITY_COLORS = {
  low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  critical: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
} as const;

/** Transaction type colors */
export const TRANSACTION_COLORS = {
  Purchase: { bg: "bg-green-500/20", text: "text-green-400" },
  Sale: { bg: "bg-red-500/20", text: "text-red-400" },
  "Sale (Full)": { bg: "bg-red-500/20", text: "text-red-400" },
  "Sale (Partial)": { bg: "bg-orange-500/20", text: "text-orange-400" },
  Exchange: { bg: "bg-blue-500/20", text: "text-blue-400" },
} as const;

/** Default page size for data tables */
export const DEFAULT_PAGE_SIZE = 25;

/** Market toggle values */
export type MarketType = "stocks" | "crypto" | "all";
