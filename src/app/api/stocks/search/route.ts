import { NextResponse } from "next/server";

import { coingeckoClient } from "@/lib/api/coingecko";
import { fmpClient } from "@/lib/api/fmp";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 1) {
      return NextResponse.json({ error: "Missing 'q' search query" }, { status: 400 });
    }

    // Search stocks and crypto in parallel
    const [stockResults, cryptoResults] = await Promise.allSettled([
      fmpClient.searchSymbols(query, 8),
      coingeckoClient.searchCoins(query),
    ]);

    const stocks =
      stockResults.status === "fulfilled"
        ? stockResults.value.slice(0, 8).map((s) => ({
            ticker: s.symbol,
            name: s.name,
            asset_type: "stock" as const,
            exchange: s.exchangeShortName || s.stockExchange,
          }))
        : [];

    const cryptos =
      cryptoResults.status === "fulfilled"
        ? cryptoResults.value.slice(0, 6).map((c) => ({
            ticker: c.symbol.toUpperCase(),
            name: c.name,
            asset_type: "crypto" as const,
            coinId: c.id,
            logoUrl: c.thumb,
          }))
        : [];

    return NextResponse.json(
      { stocks, cryptos },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("[API] Ticker search error:", error);
    return NextResponse.json({ error: "Failed to search tickers" }, { status: 500 });
  }
}
