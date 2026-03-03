import { NextResponse } from "next/server";

import { fmpClient } from "@/lib/api/fmp";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    if (!symbols) {
      return NextResponse.json({ error: "Missing required 'symbols' parameter" }, { status: 400 });
    }

    // Support comma-separated symbols: AAPL,MSFT,GOOGL
    // Single batched call — FMP accepts comma-separated list (300 calls/min on Starter plan)
    const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase());
    const quotes = await fmpClient.getQuote(symbolList);

    return NextResponse.json(
      { quotes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("[API] Stock quotes error:", error);
    return NextResponse.json({ error: "Failed to fetch stock quotes" }, { status: 500 });
  }
}
