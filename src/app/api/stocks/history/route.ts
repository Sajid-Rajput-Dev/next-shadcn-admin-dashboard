import { NextResponse } from "next/server";

import { fmpClient } from "@/lib/api/fmp";
import { CACHE_TTL } from "@/lib/utils/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!symbol) {
      return NextResponse.json({ error: "Missing 'symbol' parameter" }, { status: 400 });
    }

    // Default to last 1 year if no range specified
    const toDate = to || new Date().toISOString().split("T")[0];
    const fromDate =
      from ||
      (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().split("T")[0];
      })();

    const data = await fmpClient.getStockHistory(symbol.toUpperCase(), fromDate, toDate);

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL.STOCK_HISTORY}, stale-while-revalidate=${CACHE_TTL.STOCK_HISTORY * 2}`,
        },
      },
    );
  } catch (error) {
    console.error("[API] Stock history error:", error);
    return NextResponse.json({ error: "Failed to fetch stock history" }, { status: 500 });
  }
}
