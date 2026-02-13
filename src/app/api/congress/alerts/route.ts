import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");
        const severity = searchParams.get("severity"); // high | medium | low

        const supabase = await createClient();

        let query = supabase
            .from("alerts_feed")
            .select("*")
            .eq("source", "congress")
            .order("event_time", { ascending: false })
            .range(offset, offset + limit - 1);

        if (severity) {
            query = query.eq("severity", severity);
        }

        const { data, error } = await query;

        if (error) {
            console.error("[API] Congress alerts DB error:", error);
            return NextResponse.json(
                { error: "Failed to fetch alerts" },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { data: data || [], total: data?.length || 0 },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                },
            },
        );
    } catch (error) {
        console.error("[API] Congress alerts error:", error);
        return NextResponse.json(
            { error: "Failed to fetch congress alerts" },
            { status: 500 },
        );
    }
}
