import { NextResponse } from "next/server";

import { fmpClient, FMPPlanError } from "@/lib/api/fmp";

const PAGE_SIZE = 25; // FMP default limit

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "0");
        const chamber = searchParams.get("chamber") || "both"; // senate | house | both

        let trades: any[] = [];
        let planLimited = false;

        if (chamber === "senate" || chamber === "both") {
            try {
                const senateTrades = await fmpClient.getSenateTrades(page, PAGE_SIZE);
                trades = [...trades, ...senateTrades];
            } catch (error) {
                if (error instanceof FMPPlanError) {
                    planLimited = true;
                } else {
                    throw error;
                }
            }
        }

        if (chamber === "house" || chamber === "both") {
            try {
                const houseTrades = await fmpClient.getHouseDisclosures(page, PAGE_SIZE);
                trades = [...trades, ...houseTrades];
            } catch (error) {
                if (error instanceof FMPPlanError) {
                    planLimited = true;
                } else {
                    throw error;
                }
            }
        }

        // Sort by disclosure date descending
        trades.sort(
            (a, b) =>
                new Date(b.disclosureDate || b.disclosure_date || "").getTime() -
                new Date(a.disclosureDate || a.disclosure_date || "").getTime(),
        );

        // hasMore is true when this request returns a full page for the selected chamber set
        const expectedPageSize = chamber === "both" ? PAGE_SIZE * 2 : PAGE_SIZE;
        const hasMore = !planLimited && trades.length >= expectedPageSize;

        return NextResponse.json(
            { data: trades, page, hasMore, planLimited },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
                },
            },
        );
    } catch (error) {
        console.error("[API] Congress trades error:", error);
        return NextResponse.json(
            { error: "Failed to fetch congress trades", details: String(error) },
            { status: 500 },
        );
    }
}
