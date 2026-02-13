import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");
        const symbol = searchParams.get("symbol");
        const minAmount = searchParams.get("min_amount");

        const supabase = await createServiceClient();

        let query = supabase
            .from("whale_transactions")
            .select("*")
            .order("timestamp", { ascending: false })
            .range(offset, offset + limit - 1);

        if (symbol) {
            query = query.eq("symbol", symbol.toUpperCase());
        }

        if (minAmount) {
            query = query.gte("amount_usd", parseFloat(minAmount));
        }

        const { data, error } = await query;

        if (error) {
            console.error("[API] Whale transactions DB error:", error);
            return NextResponse.json(
                { error: "Failed to fetch whale transactions" },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { data: data || [], total: data?.length || 0 },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
                },
            },
        );
    } catch (error) {
        console.error("[API] Whale transactions error:", error);
        return NextResponse.json(
            { error: "Failed to fetch whale transactions" },
            { status: 500 },
        );
    }
}
