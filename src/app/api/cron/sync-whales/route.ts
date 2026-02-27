import { NextResponse } from "next/server";

import { whaleAlertClient } from "@/lib/api/whale-alert";
import { WHALE_MIN_VALUE_USD } from "@/lib/utils/constants";
import { createServiceClient } from "@/lib/supabase/server";

// Vercel Cron: runs every 1 minute for near-real-time whale alerts
// vercel.json: { "crons": [{ "path": "/api/cron/sync-whales", "schedule": "*/1 * * * *" }] }

export async function POST(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createServiceClient();

        // Fetch recent transactions (last 2 minutes to catch overlap with 1-min cron)
        const since = Math.floor(Date.now() / 1000) - 120;
        const result = await whaleAlertClient.getRecentTransactions({
            start: since,
            minValueUsd: WHALE_MIN_VALUE_USD, // $100K+ (Custom Alerts plan)
            limit: 100,
        });

        if (!result.transactions || result.transactions.length === 0) {
            return NextResponse.json({
                success: true,
                synced: 0,
                timestamp: new Date().toISOString(),
            });
        }

        const rows = result.transactions.map((tx) => ({
            tx_hash: tx.hash,
            blockchain: tx.blockchain || "unknown",
            symbol: tx.symbol?.toUpperCase() || "UNKNOWN",
            transaction_type: tx.transaction_type || "transfer",
            amount: tx.amount || 0,
            amount_usd: tx.amount_usd || 0,
            from_owner: tx.from?.owner || null,
            to_owner: tx.to?.owner || null,
            from_owner_type: tx.from?.owner_type || null,
            to_owner_type: tx.to?.owner_type || null,
            alert_text: null as string | null,
            timestamp: new Date(tx.timestamp * 1000).toISOString(),
        }));

        const { error, count } = await supabase
            .from("whale_transactions")
            .upsert(rows as any, {
                onConflict: "tx_hash,blockchain",
                ignoreDuplicates: true,
            });

        if (error) {
            console.error("[CRON] Whale upsert error:", error);
            return NextResponse.json(
                { error: "Failed to sync whale transactions" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            synced: count || rows.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[CRON] Sync whales error:", error);
        return NextResponse.json(
            { error: "Sync failed" },
            { status: 500 },
        );
    }
}
