import type { Database } from "./database";

/** Database row type (live Supabase schema) */
export type CongressTradeRow = Database["public"]["Tables"]["congress_trades"]["Row"];

/**
 * Congress trade as returned by the FMP API (via /api/congress/trades).
 * Fields come from FMP /stable/senate-latest and /stable/house-latest.
 */
export interface CongressTrade {
    // Core FMP fields
    symbol: string;
    disclosureDate: string;
    transactionDate: string;
    firstName: string;
    lastName: string;
    office: string;
    district: string;
    owner: string;
    assetDescription: string;
    assetType: string;
    type: string;
    amount: string;
    capitalGainsOver200USD?: string;
    comment?: string;
    link?: string;
    // Aliases added by our route
    ticker?: string;
    representative?: string;
    state?: string;
    disclosure_date?: string;
    transaction_type?: string;
    amount_range?: string;
    // Computed
    severity?: AlertSeverity;
}

/** Politician derived from congress_trades data */
export interface Politician {
    name: string;
    party: string | null;
    chamber: string | null;
    state: string | null;
    tradeCount: number;
    latestTradeDate: string;
    /** URL to politician image */
    image_url?: string | null;
    /** Top tickers traded by volume */
    topTickers?: string[];
}

/** Filters for congress trades table */
export interface TradeFilter {
    politician?: string;
    party?: "Democrat" | "Republican" | "Independent" | "";
    chamber?: "Senate" | "House" | "";
    ticker?: string;
    transactionType?: "Purchase" | "Sale" | "Sale (Full)" | "Sale (Partial)" | "Exchange" | "";
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

/** Alert severity levels */
export type AlertSeverity = "low" | "medium" | "high" | "critical";

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
