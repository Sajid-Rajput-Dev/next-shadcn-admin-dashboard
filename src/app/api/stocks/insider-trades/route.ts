import { NextResponse } from "next/server";

import { FMPPlanError, fmpClient } from "@/lib/api/fmp";
import { CACHE_TTL } from "@/lib/utils/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);
    const statsOnly = searchParams.get("stats") === "true";

    if (!symbol) {
      return NextResponse.json({ error: "Missing 'symbol' parameter" }, { status: 400 });
    }

    if (statsOnly) {
      const stats = await fmpClient.getInsiderTradeStats(symbol.toUpperCase());
      return NextResponse.json(
        { stats },
        {
          headers: {
            "Cache-Control": `public, s-maxage=${CACHE_TTL.INSIDER_TRADES}, stale-while-revalidate=${CACHE_TTL.INSIDER_TRADES * 2}`,
          },
        },
      );
    }

    const data = await fmpClient.getInsiderTrades(symbol.toUpperCase(), limit, page);

    return NextResponse.json(
      { data, symbol: symbol.toUpperCase(), page },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL.INSIDER_TRADES}, stale-while-revalidate=${CACHE_TTL.INSIDER_TRADES * 2}`,
        },
      },
    );
  } catch (error) {
    if (error instanceof FMPPlanError) {
      return NextResponse.json({ data: [], stats: [], planLimited: true });
    }
    console.error("[API] Insider trades error:", error);
    return NextResponse.json({ error: "Failed to fetch insider trades" }, { status: 500 });
  }
}
