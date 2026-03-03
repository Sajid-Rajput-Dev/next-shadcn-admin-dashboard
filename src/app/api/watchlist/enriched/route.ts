import { NextResponse } from "next/server";

import { coingeckoClient } from "@/lib/api/coingecko";
import { fmpClient } from "@/lib/api/fmp";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TTL } from "@/lib/utils/constants";
import type { Database } from "@/types/database";

type WatchlistRow = Database["public"]["Tables"]["watchlist_items"]["Row"];

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch watchlist items (ordered by added_at until display_order migration is applied)
    const { data: rawItems, error } = await supabase
      .from("watchlist_items")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("[API] Watchlist enriched GET error:", error);
      return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
    }

    const items = (rawItems ?? []) as WatchlistRow[];

    if (items.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // 2. Split by asset type
    const stockItems = items.filter((i) => i.asset_type === "stock");
    const cryptoItems = items.filter((i) => i.asset_type === "crypto");

    const stockTickers = stockItems.map((i) => i.ticker);
    const cryptoTickers = new Set(cryptoItems.map((i) => i.ticker.toUpperCase()));

    // 3. Fetch live prices in parallel
    const [stockQuotes, cryptoMarkets, congressCountsResult, whaleCountsResult] = await Promise.allSettled([
      // Stock quotes via FMP
      stockTickers.length > 0 ? fmpClient.getQuote(stockTickers) : Promise.resolve([]),
      // Crypto via CoinGecko top-250 (covers most tracked assets)
      cryptoItems.length > 0 ? coingeckoClient.getCoinsMarkets("usd", 250, 1, false) : Promise.resolve([]),
      // Congress trade counts per ticker (last 30 days)
      stockTickers.length > 0
        ? supabase
            .from("congress_trades")
            .select("ticker")
            .in("ticker", stockTickers)
            .gte("transaction_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        : Promise.resolve({ data: [] as { ticker: string }[], error: null }),
      // Whale activity counts per crypto ticker (last 7 days)
      cryptoItems.length > 0
        ? supabase
            .from("whale_transactions")
            .select("symbol")
            .in("symbol", [...cryptoTickers])
            .gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        : Promise.resolve({ data: [] as { symbol: string }[], error: null }),
    ]);

    // 4. Build lookup maps
    const quoteMap = new Map<
      string,
      {
        price: number;
        changePercent: number;
        change: number;
        dayHigh: number;
        dayLow: number;
        volume: number;
        marketCap: number;
      }
    >();
    if (stockQuotes.status === "fulfilled") {
      for (const q of stockQuotes.value) {
        quoteMap.set(q.symbol.toUpperCase(), {
          price: q.price ?? 0,
          changePercent: q.changePercentage ?? q.changesPercentage ?? 0,
          change: q.change ?? 0,
          dayHigh: q.dayHigh ?? 0,
          dayLow: q.dayLow ?? 0,
          volume: q.volume ?? 0,
          marketCap: q.marketCap ?? 0,
        });
      }
    }

    const cryptoMap = new Map<
      string,
      {
        price: number;
        changePercent: number;
        change: number;
        dayHigh: number;
        dayLow: number;
        volume: number;
        marketCap: number;
      }
    >();
    if (cryptoMarkets.status === "fulfilled") {
      for (const c of cryptoMarkets.value) {
        const sym = c.symbol.toUpperCase();
        if (cryptoTickers.has(sym)) {
          cryptoMap.set(sym, {
            price: c.current_price ?? 0,
            changePercent: c.price_change_percentage_24h ?? 0,
            change: c.price_change_24h ?? 0,
            dayHigh: c.high_24h ?? 0,
            dayLow: c.low_24h ?? 0,
            volume: c.total_volume ?? 0,
            marketCap: c.market_cap ?? 0,
          });
        }
      }
    }

    // Congress trade counts per ticker
    const congressCountMap = new Map<string, number>();
    if (congressCountsResult.status === "fulfilled" && congressCountsResult.value.data) {
      for (const row of congressCountsResult.value.data) {
        const t = (row as { ticker: string }).ticker?.toUpperCase();
        if (t) congressCountMap.set(t, (congressCountMap.get(t) ?? 0) + 1);
      }
    }

    // Whale activity counts per symbol
    const whaleCountMap = new Map<string, number>();
    if (whaleCountsResult.status === "fulfilled" && whaleCountsResult.value.data) {
      for (const row of whaleCountsResult.value.data) {
        const s = (row as { symbol: string }).symbol?.toUpperCase();
        if (s) whaleCountMap.set(s, (whaleCountMap.get(s) ?? 0) + 1);
      }
    }

    // 5. Merge enrichment onto each item
    const enriched = items.map((item) => {
      const ticker = item.ticker.toUpperCase();
      const priceData = item.asset_type === "stock" ? quoteMap.get(ticker) : cryptoMap.get(ticker);

      return {
        ...item,
        currentPrice: priceData?.price ?? null,
        changePercent: priceData?.changePercent ?? null,
        change: priceData?.change ?? null,
        dayHigh: priceData?.dayHigh ?? null,
        dayLow: priceData?.dayLow ?? null,
        volume: priceData?.volume ?? null,
        marketCap: priceData?.marketCap ?? null,
        displayName: item.name ?? ticker,
        congressTradeCount: congressCountMap.get(ticker) ?? 0,
        whaleActivityCount: whaleCountMap.get(ticker) ?? 0,
      };
    });

    return NextResponse.json(
      { data: enriched },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL.STOCK_QUOTES}, stale-while-revalidate=120`,
        },
      },
    );
  } catch (error) {
    console.error("[API] Watchlist enriched GET error:", error);
    return NextResponse.json({ error: "Failed to fetch enriched watchlist" }, { status: 500 });
  }
}
