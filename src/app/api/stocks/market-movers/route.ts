import { NextResponse } from "next/server";

import { FMPPlanError, fmpClient } from "@/lib/api/fmp";
import { CACHE_TTL } from "@/lib/utils/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "gainers") as "gainers" | "losers" | "actives";

    if (!["gainers", "losers", "actives"].includes(type)) {
      return NextResponse.json({ error: "Invalid type. Must be: gainers | losers | actives" }, { status: 400 });
    }

    const data = await fmpClient.getMarketMovers(type);

    return NextResponse.json(
      { data, type },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL.MARKET_MOVERS}, stale-while-revalidate=${CACHE_TTL.MARKET_MOVERS * 2}`,
        },
      },
    );
  } catch (error) {
    if (error instanceof FMPPlanError) {
      return NextResponse.json({ data: [], planLimited: true });
    }
    console.error("[API] Market movers error:", error);
    return NextResponse.json({ error: "Failed to fetch market movers" }, { status: 500 });
  }
}
