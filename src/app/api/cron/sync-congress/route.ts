import { NextResponse } from "next/server";

import { fmpClient } from "@/lib/api/fmp";
import { createServiceClient } from "@/lib/supabase/server";

// Vercel Cron: runs every 15 minutes
// vercel.json: { "crons": [{ "path": "/api/cron/sync-congress", "schedule": "*/15 * * * *" }] }

export async function POST(request: Request) {
    try {
        // Verify cron secret (Vercel sets this header)
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createServiceClient();
        let upsertedCount = 0;

        // Fetch latest Senate trades (page 0 = most recent)
        const senateTrades = await fmpClient.getSenateTrades(0);
        if (senateTrades.length > 0) {
            const senateRows = senateTrades.map((trade) => ({
                ticker: trade.symbol || trade.ticker || "N/A",
                politician: `${trade.firstName} ${trade.lastName}`.trim() || "Unknown",
                party: null,
                chamber: "Senate",
                trade_issuer: trade.assetDescription || null,
                publication_date: trade.disclosureDate || trade.dateRecieved || null,
                transaction_date: trade.transactionDate || null,
                owner_type: trade.owner || null,
                transaction_type: trade.type || "Unknown",
                amount_range: trade.amount || null,
                report_url: trade.link || null,
            }));

            const { error, count } = await supabase
                .from("congress_trades")
                .upsert(senateRows as any, {
                    onConflict: "politician,ticker,transaction_date,transaction_type,amount_range",
                    ignoreDuplicates: true,
                });

            if (error) {
                console.error("[CRON] Senate upsert error:", error);
            } else {
                upsertedCount += count || senateRows.length;
            }
        }

        // Fetch latest House trades
        const houseTrades = await fmpClient.getHouseDisclosures(0);
        if (houseTrades.length > 0) {
            const houseRows = houseTrades.map((trade) => ({
                ticker: trade.symbol || trade.ticker || "N/A",
                politician: `${trade.firstName} ${trade.lastName}`.trim() || "Unknown",
                party: null,
                chamber: "House",
                trade_issuer: trade.assetDescription || null,
                publication_date: trade.disclosureDate || trade.disclosure_date || null,
                transaction_date: trade.transactionDate || null,
                owner_type: trade.owner || null,
                transaction_type: trade.type || "Unknown",
                amount_range: trade.amount || null,
                report_url: trade.link || null,
            }));

            const { error, count } = await supabase
                .from("congress_trades")
                .upsert(houseRows as any, {
                    onConflict: "politician,ticker,transaction_date,transaction_type,amount_range",
                    ignoreDuplicates: true,
                });

            if (error) {
                console.error("[CRON] House upsert error:", error);
            } else {
                upsertedCount += count || houseRows.length;
            }
        }

        return NextResponse.json({
            success: true,
            synced: upsertedCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[CRON] Sync congress error:", error);
        return NextResponse.json(
            { error: "Sync failed" },
            { status: 500 },
        );
    }
}
