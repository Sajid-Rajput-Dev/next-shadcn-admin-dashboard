"use client";

import Link from "next/link";

import { ExternalLink, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { useMarketMovers } from "@/hooks/use-market-movers";
import { useMarketStore } from "@/stores/market-store";

export function MarketMoversMini() {
  const { market } = useMarketStore();
  const isCrypto = market === "crypto";

  const gainers = useMarketMovers("gainers");
  const losers = useMarketMovers("losers");
  const crypto = useCryptoPrices(1, 20);

  const isLoading = isCrypto ? crypto.isLoading : gainers.isLoading || losers.isLoading;

  // Crypto mode: derive gainers/losers from CoinGecko prices
  const cryptoCoins = (crypto.data?.data ?? []).sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
  );
  const cryptoGainers = cryptoCoins.slice(0, 5).map((c) => ({
    symbol: c.symbol.toUpperCase(),
    pct: c.price_change_percentage_24h,
    price: c.current_price,
  }));
  const cryptoLosers = [...cryptoCoins]
    .reverse()
    .slice(0, 5)
    .map((c) => ({
      symbol: c.symbol.toUpperCase(),
      pct: c.price_change_percentage_24h,
      price: c.current_price,
    }));

  // Stock mode: from market movers API
  const stockGainers = (gainers.data?.data ?? []).slice(0, 5).map((m) => ({
    symbol: m.symbol,
    pct: m.changesPercentage,
    price: m.price,
  }));
  const stockLosers = (losers.data?.data ?? []).slice(0, 5).map((m) => ({
    symbol: m.symbol,
    pct: m.changesPercentage,
    price: m.price,
  }));

  const topGainers = isCrypto ? cryptoGainers : stockGainers;
  const topLosers = isCrypto ? cryptoLosers : stockLosers;

  const chartData = [
    ...topGainers.map((g) => ({ symbol: g.symbol, value: g.pct, type: "gain" as const })),
    ...topLosers.map((l) => ({ symbol: l.symbol, value: l.pct, type: "loss" as const })),
  ].sort((a, b) => b.value - a.value);

  return (
    <Card className="bg-card/50 border-white/5 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <CardTitle className="text-sm font-semibold">{isCrypto ? "Crypto Movers" : "Stock Movers"}</CardTitle>
        </div>
        <Link
          href="/dashboard/market-movers"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pb-4">
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
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Top 3 {isCrypto ? "Crypto" : "Stock"} Gainers
              </p>
              {topGainers.slice(0, 3).map((g) => (
                <div key={g.symbol} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{g.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">${g.price.toFixed(2)}</span>
                    <Badge
                      variant="outline"
                      className="text-green-400 border-green-500/30 bg-green-500/10 px-1.5 py-0 text-xs"
                    >
                      +{g.pct.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider pt-1">
                Top 3 {isCrypto ? "Crypto" : "Stock"} Losers
              </p>
              {topLosers.slice(0, 3).map((l) => (
                <div key={l.symbol} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{l.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">${l.price.toFixed(2)}</span>
                    <Badge
                      variant="outline"
                      className="text-red-400 border-red-500/30 bg-red-500/10 px-1.5 py-0 text-xs"
                    >
                      {l.pct.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
