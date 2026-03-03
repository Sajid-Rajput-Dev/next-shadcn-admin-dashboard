import { NextResponse } from "next/server";

import { fmpClient } from "@/lib/api/fmp";

export async function GET() {
  try {
    const sectors = await fmpClient.getSectorPerformance();

    // Shape data for heatmap visualization
    const data = sectors.map((sector) => ({
      name: sector.sector,
      value: parseFloat(sector.changesPercentage?.replace("%", "") || "0"),
    }));

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("[API] Heatmap error:", error);
    return NextResponse.json({ error: "Failed to fetch sector performance" }, { status: 500 });
  }
}
