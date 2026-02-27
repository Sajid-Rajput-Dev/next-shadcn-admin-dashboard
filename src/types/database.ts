/** Database type definitions for Supabase */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            user_preferences: {
                Row: {
                    user_id: string;
                    theme_mode: string | null;
                    market_context: string | null;
                    email_notifications: boolean | null;
                    push_notifications: boolean | null;
                    updated_at: string | null;
                };
                Insert: {
                    user_id: string;
                    theme_mode?: string | null;
                    market_context?: string | null;
                    email_notifications?: boolean | null;
                    push_notifications?: boolean | null;
                    updated_at?: string | null;
                };
                Update: {
                    user_id?: string;
                    theme_mode?: string | null;
                    market_context?: string | null;
                    email_notifications?: boolean | null;
                    push_notifications?: boolean | null;
                    updated_at?: string | null;
                };
            };
            congress_trades: {
                Row: {
                    id: string;
                    ticker: string;
                    politician: string;
                    party: string | null;
                    chamber: string | null;
                    trade_issuer: string | null;
                    publication_date: string | null;
                    transaction_date: string | null;
                    owner_type: string | null;
                    transaction_type: string | null;
                    amount_range: string | null;
                    price: number | null;
                    report_url: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    ticker: string;
                    politician: string;
                    party?: string | null;
                    chamber?: string | null;
                    trade_issuer?: string | null;
                    publication_date?: string | null;
                    transaction_date?: string | null;
                    owner_type?: string | null;
                    transaction_type?: string | null;
                    amount_range?: string | null;
                    price?: number | null;
                    report_url?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    id?: string;
                    ticker?: string;
                    politician?: string;
                    party?: string | null;
                    chamber?: string | null;
                    trade_issuer?: string | null;
                    publication_date?: string | null;
                    transaction_date?: string | null;
                    owner_type?: string | null;
                    transaction_type?: string | null;
                    amount_range?: string | null;
                    price?: number | null;
                    report_url?: string | null;
                    created_at?: string | null;
                };
            };
            whale_transactions: {
                Row: {
                    id: string;
                    blockchain: string;
                    tx_hash: string;
                    symbol: string;
                    transaction_type: string;
                    amount: number;
                    amount_usd: number | null;
                    from_address: string | null;
                    to_address: string | null;
                    from_owner: string | null;
                    to_owner: string | null;
                    from_owner_type: string | null;
                    to_owner_type: string | null;
                    alert_text: string | null;
                    timestamp: string;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    blockchain: string;
                    tx_hash: string;
                    symbol: string;
                    transaction_type?: string;
                    amount: number;
                    amount_usd?: number | null;
                    from_address?: string | null;
                    to_address?: string | null;
                    from_owner?: string | null;
                    to_owner?: string | null;
                    from_owner_type?: string | null;
                    to_owner_type?: string | null;
                    alert_text?: string | null;
                    timestamp: string;
                    created_at?: string | null;
                };
                Update: {
                    id?: string;
                    blockchain?: string;
                    tx_hash?: string;
                    symbol?: string;
                    transaction_type?: string;
                    amount?: number;
                    amount_usd?: number | null;
                    from_address?: string | null;
                    to_address?: string | null;
                    from_owner?: string | null;
                    to_owner?: string | null;
                    from_owner_type?: string | null;
                    to_owner_type?: string | null;
                    alert_text?: string | null;
                    timestamp?: string;
                    created_at?: string | null;
                };
            };
            watchlist_items: {
                Row: {
                    id: string;
                    user_id: string;
                    ticker: string;
                    asset_type: string;
                    name: string | null;
                    added_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    ticker: string;
                    asset_type: string;
                    name?: string | null;
                    added_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    ticker?: string;
                    asset_type?: string;
                    name?: string | null;
                    added_at?: string | null;
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