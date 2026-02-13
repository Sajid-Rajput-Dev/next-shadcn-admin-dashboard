import type { Database } from "./database";

/** Database row types */
export type CongressTradeRow = Database["public"]["Tables"]["congress_trades"]["Row"];

/** Congress trade with computed fields for UI display */
export interface CongressTrade extends CongressTradeRow {
    /** Computed severity based on amount_range */
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
