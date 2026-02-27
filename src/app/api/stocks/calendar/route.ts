import { NextResponse } from "next/server";

import { fmpClient } from "@/lib/api/fmp";
import { CACHE_TTL } from "@/lib/utils/constants";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = (searchParams.get("type") || "earnings") as "earnings" | "dividends";

        // Default to the next 2 weeks if no range specified
        const today = new Date();
        const twoWeeks = new Date(today);
        twoWeeks.setDate(twoWeeks.getDate() + 14);

        const from = searchParams.get("from") || today.toISOString().split("T")[0];
        const to = searchParams.get("to") || twoWeeks.toISOString().split("T")[0];

        let data: unknown[];
        if (type === "dividends") {
            data = await fmpClient.getDividendsCalendar(from, to);
        } else {
            data = await fmpClient.getEarningsCalendar(from, to);
        }

        return NextResponse.json(
            { data, type, from, to },
            {
                headers: {
                    "Cache-Control": `public, s-maxage=${CACHE_TTL.EARNINGS_CALENDAR}, stale-while-revalidate=${CACHE_TTL.EARNINGS_CALENDAR * 2}`,
                },
            },
        );
    } catch (error) {
        console.error("[API] Calendar error:", error);
        return NextResponse.json(
            { error: "Failed to fetch calendar data" },
            { status: 500 },
        );
    }
}
