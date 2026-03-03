import { NextResponse } from "next/server";

import { whaleAlertClient } from "@/lib/api/whale-alert";
import { createServiceClient } from "@/lib/supabase/server";
import { WHALE_MIN_VALUE_USD } from "@/lib/utils/constants";

/** Upsert fresh transactions from Whale Alert into the DB (fire-and-forget safe) */
async function backgroundSync() {
  try {
    const supabase = await createServiceClient();
    const since = Math.floor(Date.now() / 1000) - 180; // last 3 minutes
    const result = await whaleAlertClient.getRecentTransactions({
      start: since,
      minValueUsd: WHALE_MIN_VALUE_USD,
      limit: 100,
    });
    if (!result.transactions?.length) return;
    const rows = result.transactions.map((tx) => ({
      tx_hash: tx.hash,
      blockchain: tx.blockchain || "unknown",
      symbol: tx.symbol?.toUpperCase() || "UNKNOWN",
      transaction_type: tx.transaction_type || "transfer",
      amount: tx.amount || 0,
      amount_usd: tx.amount_usd || 0,
      from_owner: tx.from?.owner || null,
      to_owner: tx.to?.owner || null,
      from_owner_type: tx.from?.owner_type || null,
      to_owner_type: tx.to?.owner_type || null,
      alert_text: null as string | null,
      timestamp: new Date(tx.timestamp * 1000).toISOString(),
    }));
    await supabase.from("whale_transactions").upsert(rows as any, {
      onConflict: "tx_hash,blockchain",
      ignoreDuplicates: true,
    });
  } catch {
    // background — never throw
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const symbol = searchParams.get("symbol");
    const minAmount = searchParams.get("min_amount");
    // New filters (unlocked by paid Whale Alert plan)
    const blockchain = searchParams.get("blockchain");
    const ownerType = searchParams.get("owner_type");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const transactionType = searchParams.get("transaction_type");

    const supabase = await createServiceClient();

    // Auto-refresh: if the newest row is older than 3 minutes, sync in background
    const { data: freshCheck } = await supabase
      .from("whale_transactions")
      .select("timestamp")
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    const freshCheckData = freshCheck as { timestamp: string } | null;
    const latestTs = freshCheckData?.timestamp ? new Date(freshCheckData.timestamp).getTime() : 0;
    if (Date.now() - latestTs > 3 * 60 * 1000) {
      // fire-and-forget — don't await so the response isn't delayed
      void backgroundSync();
    }

    // Count query — separate request with same filters, no range
    let countQuery = supabase.from("whale_transactions").select("*", { count: "exact", head: true });

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

    const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([countQuery, dataQuery]);

    if (countError || dataError) {
      const err = countError || dataError;
      console.error("[API] Whale transactions DB error:", err);
      return NextResponse.json({ error: "Failed to fetch whale transactions" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to fetch whale transactions" }, { status: 500 });
  }
}
