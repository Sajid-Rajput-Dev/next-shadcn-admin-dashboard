import { NextResponse } from "next/server";

import { FMPPlanError, fmpClient } from "@/lib/api/fmp";
import { CACHE_TTL } from "@/lib/utils/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "general") as "general" | "stock" | "crypto" | "forex";
    const symbol = searchParams.get("symbol") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);

    const data = await fmpClient.getNews({ type, symbol, limit, page });

    return NextResponse.json(
      { data, type, symbol, page },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL.NEWS}, stale-while-revalidate=${CACHE_TTL.NEWS * 2}`,
        },
      },
    );
  } catch (error) {
    if (error instanceof FMPPlanError) {
      return NextResponse.json({ data: [], planLimited: true });
    }
    console.error("[API] News error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
