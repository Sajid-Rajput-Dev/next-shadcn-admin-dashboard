import { NextResponse } from "next/server";

import { coingeckoClient } from "@/lib/api/coingecko";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "20", 10);
    const _order = (searchParams.get("order") || "market_cap_desc") as
      | "market_cap_desc"
      | "market_cap_asc"
      | "volume_desc"
      | "volume_asc";

    const data = await coingeckoClient.getCoinsMarkets(
      "usd", // vsCurrency
      perPage,
      page,
      false, // sparkline
    );

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("[API] Crypto prices error:", error);
    return NextResponse.json({ error: "Failed to fetch crypto prices" }, { status: 500 });
  }
}
