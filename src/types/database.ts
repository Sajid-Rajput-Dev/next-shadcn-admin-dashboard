/** Database type definitions for Supabase */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            user_preferences: {
                Row: {
                    user_id: string;
                    default_market: string;
                    alert_email: boolean;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    default_market?: string;
                    alert_email?: boolean;
                    created_at?: string;
                };
                Update: {
                    user_id?: string;
                    default_market?: string;
                    alert_email?: boolean;
                    created_at?: string;
                };
            };
            congress_trades: {
                Row: {
                    id: string;
                    politician_name: string;
                    politician_party: string | null;
                    politician_chamber: string | null;
                    politician_state: string | null;
                    ticker: string;
                    company_name: string | null;
                    transaction_type: string;
                    amount_range: string | null;
                    transaction_date: string;
                    disclosure_date: string;
                    sector: string | null;
                    source_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    politician_name: string;
                    politician_party?: string | null;
                    politician_chamber?: string | null;
                    politician_state?: string | null;
                    ticker: string;
                    company_name?: string | null;
                    transaction_type: string;
                    amount_range?: string | null;
                    transaction_date: string;
                    disclosure_date: string;
                    sector?: string | null;
                    source_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    politician_name?: string;
                    politician_party?: string | null;
                    politician_chamber?: string | null;
                    politician_state?: string | null;
                    ticker?: string;
                    company_name?: string | null;
                    transaction_type?: string;
                    amount_range?: string | null;
                    transaction_date?: string;
                    disclosure_date?: string;
                    sector?: string | null;
                    source_url?: string | null;
                    created_at?: string;
                };
            };
            whale_transactions: {
                Row: {
                    id: string;
                    blockchain: string;
                    tx_hash: string;
                    symbol: string;
                    amount: number;
                    amount_usd: number;
                    from_owner_type: string | null;
                    to_owner_type: string | null;
                    timestamp: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    blockchain: string;
                    tx_hash: string;
                    symbol: string;
                    amount: number;
                    amount_usd: number;
                    from_owner_type?: string | null;
                    to_owner_type?: string | null;
                    timestamp: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    blockchain?: string;
                    tx_hash?: string;
                    symbol?: string;
                    amount?: number;
                    amount_usd?: number;
                    from_owner_type?: string | null;
                    to_owner_type?: string | null;
                    timestamp?: string;
                    created_at?: string;
                };
            };
            watchlist_items: {
                Row: {
                    id: string;
                    user_id: string;
                    ticker: string;
                    asset_type: string;
                    added_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    ticker: string;
                    asset_type: string;
                    added_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    ticker?: string;
                    asset_type?: string;
                    added_at?: string;
                };
            };
        };
        Views: {
            alerts_feed: {
                Row: {
                    id: string;
                    source: string;
                    actor: string;
                    symbol: string;
                    action: string;
                    amount_display: string;
                    event_time: string;
                    severity: string;
                };
            };
        };
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}
