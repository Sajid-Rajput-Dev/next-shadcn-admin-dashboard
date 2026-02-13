import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createServiceClient();

        // Fetch distinct politicians from congress_trades
        // Using actual DB column names: politician, party, chamber
        const { data, error } = await supabase
            .from("congress_trades")
            .select("politician, party, chamber, publication_date, ticker")
            .order("publication_date", { ascending: false })
            .limit(500);

        if (error) throw error;

        const trades = (data as any[]) || [];

        const politiciansMap = new Map<string, any>();

        trades.forEach((trade) => {
            const name = trade.politician;
            if (!name) return;

            if (!politiciansMap.has(name)) {
                politiciansMap.set(name, {
                    name,
                    party: trade.party || "Unknown",
                    state: null,
                    chamber: trade.chamber || "Unknown",
                    image_url: null,
                    tradeCount: 1,
                    latestTradeDate: trade.publication_date,
                    topTickers: [trade.ticker].filter(Boolean),
                });
            } else {
                const pol = politiciansMap.get(name);
                pol.tradeCount += 1;
                // Track unique tickers
                if (trade.ticker && !pol.topTickers.includes(trade.ticker)) {
                    pol.topTickers.push(trade.ticker);
                }
            }
        });

        const politicians = Array.from(politiciansMap.values());

        return NextResponse.json(
            { data: politicians },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
                },
            },
        );
    } catch (error) {
        console.error("[API] Politicians error:", error);
        return NextResponse.json(
            { error: "Failed to fetch politicians" },
            { status: 500 },
        );
    }
}
