import { NextResponse } from "next/server";

import { fmpClient } from "@/lib/api/fmp";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbols = searchParams.get("symbols");

        if (!symbols) {
            return NextResponse.json(
                { error: "Missing required 'symbols' parameter" },
                { status: 400 },
            );
        }

        // Support comma-separated symbols: AAPL,MSFT,GOOGL
        const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase());
        const quotes = await Promise.all(
            symbolList.map((symbol) => fmpClient.getQuote(symbol)),
        );

        // Flatten: getQuote returns an array per symbol
        const data = quotes.flat();

        return NextResponse.json(
            { data },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
            },
        );
    } catch (error) {
        console.error("[API] Stock quotes error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stock quotes" },
            { status: 500 },
        );
    }
}
