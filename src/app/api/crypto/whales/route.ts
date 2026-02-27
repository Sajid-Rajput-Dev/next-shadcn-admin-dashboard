import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");
        const symbol = searchParams.get("symbol");
        const minAmount = searchParams.get("min_amount");
        // New filters (unlocked by paid Whale Alert plan)
        const blockchain = searchParams.get("blockchain");
        const ownerType = searchParams.get("owner_type");
        const dateFrom = searchParams.get("date_from");
        const dateTo = searchParams.get("date_to");
        const transactionType = searchParams.get("transaction_type");

        const supabase = await createServiceClient();

        // Count query — separate request with same filters, no range
        let countQuery = supabase
            .from("whale_transactions")
            .select("*", { count: "exact", head: true });

        // Data query
        let dataQuery = supabase
            .from("whale_transactions")
            .select("*")
            .order("timestamp", { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply shared filters to both queries
        const applyFilters = <T extends typeof countQuery | typeof dataQuery>(q: T): T => {
            let r = q as any;
            if (symbol) r = r.eq("symbol", symbol.toUpperCase());
            if (minAmount) r = r.gte("amount_usd", parseFloat(minAmount));
            if (blockchain) r = r.eq("blockchain", blockchain.toLowerCase());
            if (ownerType) r = r.eq("from_owner_type", ownerType);
            if (transactionType) r = r.eq("transaction_type", transactionType);
            if (dateFrom) r = r.gte("timestamp", new Date(dateFrom).toISOString());
            if (dateTo) r = r.lte("timestamp", new Date(dateTo).toISOString());
            return r as T;
        };

        countQuery = applyFilters(countQuery);
        dataQuery = applyFilters(dataQuery);

        const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
            countQuery,
            dataQuery,
        ]);

        if (countError || dataError) {
            const err = countError || dataError;
            console.error("[API] Whale transactions DB error:", err);
            return NextResponse.json(
                { error: "Failed to fetch whale transactions" },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { data: data || [], total: count ?? 0, limit, offset },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
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
