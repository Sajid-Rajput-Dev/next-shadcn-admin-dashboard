import { NextResponse } from "next/server";

import { fmpClient } from "@/lib/api/fmp";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "0");
        const chamber = searchParams.get("chamber") || "both"; // senate | house | both

        // FMP free plan only supports page=0
        if (page > 0) {
            return NextResponse.json(
                { data: [], page, hasMore: false, note: "Pagination limited on free plan" },
                {
                    headers: {
                        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
                    },
                },
            );
        }

        let trades: any[] = [];

        if (chamber === "senate" || chamber === "both") {
            const senateTrades = await fmpClient.getSenateTrades(page);
            trades = [...trades, ...senateTrades];
        }

        if (chamber === "house" || chamber === "both") {
            const houseTrades = await fmpClient.getHouseDisclosures(page);
            trades = [...trades, ...houseTrades];
        }

        // Sort by disclosure date descending
        trades.sort(
            (a, b) =>
                new Date(b.disclosureDate || b.disclosure_date || "").getTime() -
                new Date(a.disclosureDate || a.disclosure_date || "").getTime(),
        );

        return NextResponse.json(
            { data: trades, page, hasMore: false },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
                },
            },
        );
    } catch (error) {
        console.error("[API] Congress trades error:", error);
        return NextResponse.json(
            { error: "Failed to fetch congress trades", details: String(error) },
            { status: 500 },
        );
    }
}
