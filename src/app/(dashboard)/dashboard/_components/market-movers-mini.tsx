"use client";

import Link from "next/link";

import { BookmarkCheck, BookmarkPlus, ExternalLink, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { useMarketMovers } from "@/hooks/use-market-movers";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useMarketStore } from "@/stores/market-store";

export function MarketMoversMini() {
  const { market } = useMarketStore();
  const isCrypto = market === "crypto";

  const gainers = useMarketMovers("gainers");
  const losers = useMarketMovers("losers");
  const crypto = useCryptoPrices(1, 20);
  const { isInWatchlist, addToWatchlist } = useWatchlist();

  const isLoading = isCrypto ? crypto.isLoading : gainers.isLoading || losers.isLoading;

  // Crypto mode: derive gainers/losers from CoinGecko prices
  const cryptoCoins = (crypto.data?.data ?? []).sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
  );
  const cryptoGainers = cryptoCoins.slice(0, 5).map((c) => ({
    symbol: c.symbol.toUpperCase(),
    pct: c.price_change_percentage_24h,
    price: c.current_price,
    coinId: c.id,
    name: c.name,
  }));
  const cryptoLosers = [...cryptoCoins]
    .reverse()
    .slice(0, 5)
    .map((c) => ({
      symbol: c.symbol.toUpperCase(),
      pct: c.price_change_percentage_24h,
      price: c.current_price,
      coinId: c.id,
      name: c.name,
    }));

  // Stock mode: from market movers API
  const stockGainers = (gainers.data?.data ?? []).slice(0, 5).map((m) => ({
    symbol: m.symbol,
    pct: m.changesPercentage,
    price: m.price,
    coinId: undefined as string | undefined,
    name: m.name ?? m.symbol,
  }));
  const stockLosers = (losers.data?.data ?? []).slice(0, 5).map((m) => ({
    symbol: m.symbol,
    pct: m.changesPercentage,
    price: m.price,
    coinId: undefined as string | undefined,
    name: m.name ?? m.symbol,
  }));

  const topGainers = isCrypto ? cryptoGainers : stockGainers;
  const topLosers = isCrypto ? cryptoLosers : stockLosers;

  const chartData = [
    ...topGainers.map((g) => ({ symbol: g.symbol, value: g.pct, type: "gain" as const })),
    ...topLosers.map((l) => ({ symbol: l.symbol, value: l.pct, type: "loss" as const })),
  ].sort((a, b) => b.value - a.value);

  return (
    <Card className="flex h-full flex-col border-white/5 bg-card/50">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <CardTitle className="font-semibold text-sm">{isCrypto ? "Crypto Movers" : "Stock Movers"}</CardTitle>
        </div>
        <Link
          href="/dashboard/market-movers"
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-primary"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pb-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Bar chart */}
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 4 }}
                  barSize={10}
                >
                  <XAxis
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="symbol"
                    width={42}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                    formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(2)}%`, "Change"]}
                  />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.type === "gain" ? "#22c55e" : "#ef4444"} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top rows */}
            <div className="space-y-1.5">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Top 3 {isCrypto ? "Crypto" : "Stock"} Gainers
              </p>
              {topGainers.slice(0, 3).map((g) => {
                const assetType = isCrypto ? "crypto" : "stock";
                const inList = isInWatchlist(g.symbol, assetType);
                return (
                  <div key={g.symbol} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{g.symbol}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">${g.price.toFixed(2)}</span>
                      <Badge
                        variant="outline"
                        className="border-green-500/30 bg-green-500/10 px-1.5 py-0 text-green-400 text-xs"
                      >
                        +{g.pct.toFixed(2)}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-white/10"
                        title={inList ? "In watchlist" : "Add to watchlist"}
                        onClick={() => {
                          if (!inList)
                            addToWatchlist({ ticker: g.symbol, asset_type: assetType, name: g.name, coinId: g.coinId });
                        }}
                      >
                        {inList ? (
                          <BookmarkCheck className="h-3 w-3 text-primary" />
                        ) : (
                          <BookmarkPlus className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
              <p className="pt-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Top 3 {isCrypto ? "Crypto" : "Stock"} Losers
              </p>
              {topLosers.slice(0, 3).map((l) => {
                const assetType = isCrypto ? "crypto" : "stock";
                const inList = isInWatchlist(l.symbol, assetType);
                return (
                  <div key={l.symbol} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{l.symbol}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">${l.price.toFixed(2)}</span>
                      <Badge
                        variant="outline"
                        className="border-red-500/30 bg-red-500/10 px-1.5 py-0 text-red-400 text-xs"
                      >
                        {l.pct.toFixed(2)}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-white/10"
                        title={inList ? "In watchlist" : "Add to watchlist"}
                        onClick={() => {
                          if (!inList)
                            addToWatchlist({ ticker: l.symbol, asset_type: assetType, name: l.name, coinId: l.coinId });
                        }}
                      >
                        {inList ? (
                          <BookmarkCheck className="h-3 w-3 text-primary" />
                        ) : (
                          <BookmarkPlus className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
