"use client";

import { useMemo } from "react";

import { Activity, ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStockQuotes } from "@/hooks/use-stock-quotes";
import { useWatchlist } from "@/hooks/use-watchlist";
import { formatCurrency } from "@/lib/utils";

export function PortfolioSummary() {
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();

  const stockSymbols = useMemo(
    () => watchlist.filter((item) => item.asset_type === "stock").map((item) => item.ticker),
    [watchlist],
  );

  const { data: stockData, isLoading: isQuotesLoading } = useStockQuotes(stockSymbols);

  const stats = useMemo(() => {
    if (!stockData?.quotes) return null;

    const quotes = stockData.quotes;
    const totalValue = quotes.reduce((sum: number, q) => sum + (q.price || 0), 0);
    const avgChange =
      quotes.length > 0 ? quotes.reduce((sum: number, q) => sum + (q.changesPercentage || 0), 0) / quotes.length : 0;

    const topMover = [...quotes].sort((a, b) => (b.changesPercentage || 0) - (a.changesPercentage || 0))[0];

    return {
      totalValue,
      avgChange,
      topMover,
      activeTrades: watchlist.length,
    };
  }, [stockData, watchlist]);

  if (isWatchlistLoading || isQuotesLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-white/5 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 rounded bg-white/5" />
              <div className="h-4 w-4 rounded bg-white/5" />
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-32 rounded bg-white/5" />
              <div className="h-3 w-48 rounded bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { totalValue, avgChange, topMover, activeTrades } = stats || {
    totalValue: 0,
    avgChange: 0,
    topMover: null,
    activeTrades: watchlist.length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-white/5 bg-card shadow-sm transition-colors hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Watchlist Value</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-white">{formatCurrency(totalValue)}</div>
          <p className="mt-1 flex items-center text-muted-foreground text-xs">
            <span className={`${avgChange >= 0 ? "text-green-500" : "text-red-500"} mr-1 flex items-center`}>
              {avgChange >= 0 ? (
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-0.5 h-3 w-3" />
              )}
              {Math.abs(avgChange).toFixed(2)}%
            </span>
            avg daily change
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card shadow-sm transition-colors hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Est. 24h P/L</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`font-bold text-2xl ${avgChange >= 0 ? "text-white" : "text-white"}`}>
            {avgChange >= 0 ? "+" : "-"}
            {formatCurrency(Math.abs(totalValue * (avgChange / 100)))}
          </div>
          <p className="mt-1 text-muted-foreground text-xs">Based on watchlist</p>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card shadow-sm transition-colors hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Top Mover</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-white">{topMover?.symbol || "—"}</div>
          <p className="mt-1 flex items-center text-muted-foreground text-xs">
            {topMover ? (
              <span
                className={`${(topMover.changesPercentage || 0) >= 0 ? "text-green-500" : "text-red-500"} mr-1 flex items-center`}
              >
                {(topMover.changesPercentage || 0) >= 0 ? (
                  <ArrowUpRight className="mr-0.5 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-0.5 h-3 w-3" />
                )}
                {Math.abs(topMover.changesPercentage || 0).toFixed(2)}%
              </span>
            ) : (
              <span>No data</span>
            )}
            today
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card shadow-sm transition-colors hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Watchlist Assets</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl text-white">{activeTrades}</div>
          <p className="mt-1 text-muted-foreground text-xs">Tracking live markets</p>
        </CardContent>
      </Card>
    </div>
  );
}
