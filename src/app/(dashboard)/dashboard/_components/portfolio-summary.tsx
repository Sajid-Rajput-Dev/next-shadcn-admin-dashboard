"use client";

import { useWatchlist } from "@/hooks/use-watchlist";
import { useStockQuotes } from "@/hooks/use-stock-quotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, Wallet, TrendingUp, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

export function PortfolioSummary() {
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  
  const stockSymbols = useMemo(() => 
    watchlist
      .filter(item => item.asset_type === "stock")
      .map(item => item.ticker),
    [watchlist]
  );

  const { data: stockData, isLoading: isQuotesLoading } = useStockQuotes(stockSymbols);
  
  const stats = useMemo(() => {
    if (!stockData?.quotes) return null;
    
    const quotes = stockData.quotes;
    const totalValue = quotes.reduce((sum: number, q) => sum + (q.price || 0), 0);
    const avgChange = quotes.length > 0 
      ? quotes.reduce((sum: number, q) => sum + (q.changesPercentage || 0), 0) / quotes.length 
      : 0;
    
    const topMover = [...quotes].sort((a, b) => (b.changesPercentage || 0) - (a.changesPercentage || 0))[0];
    
    return {
      totalValue,
      avgChange,
      topMover,
      activeTrades: watchlist.length
    };
  }, [stockData, watchlist]);


  if (isWatchlistLoading || isQuotesLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-white/5 shadow-sm animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-white/5 rounded" />
              <div className="h-4 w-4 bg-white/5 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-white/5 rounded mb-2" />
              <div className="h-3 w-48 bg-white/5 rounded" />
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
    activeTrades: watchlist.length
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-white/5 shadow-sm hover:border-primary/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Watchlist Value</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className={`${avgChange >= 0 ? "text-green-500" : "text-red-500"} flex items-center mr-1`}>
              {avgChange >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              {Math.abs(avgChange).toFixed(2)}%
            </span>
            avg daily change
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-white/5 shadow-sm hover:border-primary/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Est. 24h P/L</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${avgChange >= 0 ? "text-white" : "text-white"}`}>
            {avgChange >= 0 ? "+" : "-"}{formatCurrency(Math.abs(totalValue * (avgChange / 100)))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on watchlist</p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-white/5 shadow-sm hover:border-primary/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Top Mover</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{topMover?.symbol || "—"}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
             {topMover ? (
               <span className={`${(topMover.changesPercentage || 0) >= 0 ? "text-green-500" : "text-red-500"} flex items-center mr-1`}>
                  {(topMover.changesPercentage || 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {Math.abs(topMover.changesPercentage || 0).toFixed(2)}%
               </span>
             ) : (
               <span>No data</span>
             )}
             today
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-white/5 shadow-sm hover:border-primary/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Watchlist Assets</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{activeTrades}</div>
          <p className="text-xs text-muted-foreground mt-1">Tracking live markets</p>
        </CardContent>
      </Card>
    </div>
  );
}

