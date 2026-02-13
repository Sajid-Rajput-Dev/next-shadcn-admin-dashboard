import { NextResponse } from "next/server";

import { whaleAlertClient } from "@/lib/api/whale-alert";
import { createServiceClient } from "@/lib/supabase/server";

// Vercel Cron: runs every 5 minutes
// vercel.json: { "crons": [{ "path": "/api/cron/sync-whales", "schedule": "*/5 * * * *" }] }

export async function POST(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createServiceClient();

        // Fetch recent transactions (last 10 minutes to catch overlap)
        const since = Math.floor(Date.now() / 1000) - 600;
        const result = await whaleAlertClient.getRecentTransactions({
            start: since,
            minValueUsd: 500000, // Only large txns ($500K+)
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
            hash: tx.hash,
            blockchain: tx.blockchain || "unknown",
            symbol: tx.symbol?.toUpperCase() || "UNKNOWN",
            transaction_type: tx.transaction_type || "transfer",
            amount: tx.amount || 0,
            amount_usd: tx.amount_usd || 0,
            from_address: tx.from?.address || null,
            to_address: tx.to?.address || null,
            from_owner_type: tx.from?.owner_type || null,
            to_owner_type: tx.to?.owner_type || null,
            timestamp: new Date(tx.timestamp * 1000).toISOString(),
        }));

        const { error, count } = await supabase
            .from("whale_transactions")
            .upsert(rows as any, {
                onConflict: "hash",
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
