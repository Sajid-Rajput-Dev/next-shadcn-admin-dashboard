"use client";

import { useMemo } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertsFeed } from "@/hooks/use-alerts-feed";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { useEarningsCalendar } from "@/hooks/use-earnings-calendar";
import { useMarketMovers } from "@/hooks/use-market-movers";
import { useStockQuotes } from "@/hooks/use-stock-quotes";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useWhaleTransactions } from "@/hooks/use-whale-transactions";
import type { FMPEarningsEvent } from "@/lib/api/fmp";
import { cn } from "@/lib/utils";
import { useMarketStore } from "@/stores/market-store";

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  iconClass,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  iconClass?: string;
}) {
  return (
    <Card className="border-white/5 bg-card/50 transition-colors hover:border-white/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-muted-foreground text-xs">{label}</p>
            <p className="mt-0.5 truncate font-bold text-white text-xl">{value}</p>
            {sub && (
              <p
                className={cn(
                  "mt-0.5 flex items-center gap-0.5 text-xs",
                  trend === "up" && "text-green-400",
                  trend === "down" && "text-red-400",
                  trend === "neutral" && "text-muted-foreground",
                  !trend && "text-muted-foreground",
                )}
              >
                {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                {sub}
              </p>
            )}
          </div>
          <div className={cn("shrink-0 rounded-lg bg-white/5 p-2", iconClass)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card className="border-white/5 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Skeleton className="mb-1 h-3 w-24" />
            <Skeleton className="mb-1 h-6 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketOverviewStrip() {
  // Data fetches
  const { market } = useMarketStore();
  const isCrypto = market === "crypto";

  const alerts = useAlertsFeed();
  const gainers = useMarketMovers("gainers");
  const losers = useMarketMovers("losers");
  const whale = useWhaleTransactions({ pageSize: 5 });
  const { watchlist } = useWatchlist();
  const cryptoPrices = useCryptoPrices(1, 20);
  const stockSymbols = useMemo(
    () =>
      watchlist.filter((w) => (isCrypto ? w.asset_type === "crypto" : w.asset_type === "stock")).map((w) => w.ticker),
    [watchlist, isCrypto],
  );
  const quotes = useStockQuotes(stockSymbols);

  // Earnings in next 7 days
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const earnings = useEarningsCalendar({ type: "earnings", from: fmt(today), to: fmt(nextWeek) });

  const isLoading =
    alerts.isLoading ||
    gainers.isLoading ||
    losers.isLoading ||
    whale.isLoading ||
    quotes.isLoading ||
    (isCrypto && cryptoPrices.isLoading);

  // Derived KPI values
  const totalAlerts = alerts.data?.data?.length ?? 0;
  const criticalAlerts = alerts.data?.data?.filter((a) => a.severity === "critical").length ?? 0;

  // Gainer / loser: use crypto when in crypto mode
  const sortedCrypto = (cryptoPrices.data?.data ?? []).sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
  );
  const topGainer = isCrypto
    ? sortedCrypto[0]
      ? { symbol: sortedCrypto[0].symbol.toUpperCase(), changesPercentage: sortedCrypto[0].price_change_percentage_24h }
      : null
    : gainers.data?.data?.[0]
      ? { symbol: gainers.data.data[0].symbol, changesPercentage: gainers.data.data[0].changesPercentage }
      : null;
  const topLoser = isCrypto
    ? sortedCrypto[sortedCrypto.length - 1]
      ? {
          symbol: sortedCrypto[sortedCrypto.length - 1].symbol.toUpperCase(),
          changesPercentage: sortedCrypto[sortedCrypto.length - 1].price_change_percentage_24h,
        }
      : null
    : losers.data?.data?.[0]
      ? { symbol: losers.data.data[0].symbol, changesPercentage: losers.data.data[0].changesPercentage }
      : null;

  const whaleCount = whale.data?.data?.length ?? 0;
  const whaleTotal = whale.data?.total ?? 0;

  const portfolioValue = useMemo(() => {
    if (!quotes.data?.quotes) return null;
    return quotes.data.quotes.reduce((sum, q) => sum + (q.price ?? 0), 0);
  }, [quotes.data]);
  const portfolioChange = useMemo(() => {
    if (!quotes.data?.quotes || quotes.data.quotes.length === 0) return 0;
    const qs = quotes.data.quotes;
    return qs.reduce((s, q) => s + (q.changesPercentage ?? 0), 0) / qs.length;
  }, [quotes.data]);

  const earningsCount = (earnings.data?.data as FMPEarningsEvent[] | undefined)?.length ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label="Active Alerts"
        value={String(totalAlerts)}
        sub={criticalAlerts > 0 ? `${criticalAlerts} critical` : "No critical"}
        icon={Bell}
        trend={criticalAlerts > 0 ? "down" : "neutral"}
        iconClass="text-orange-400"
      />

      <KpiCard
        label={isCrypto ? "Top Crypto Gainer" : "Top Gainer"}
        value={topGainer ? `${topGainer.symbol}` : "—"}
        sub={topGainer ? `+${topGainer.changesPercentage.toFixed(2)}%` : undefined}
        icon={TrendingUp}
        trend="up"
        iconClass="text-green-400"
      />

      <KpiCard
        label={isCrypto ? "Top Crypto Loser" : "Top Loser"}
        value={topLoser ? `${topLoser.symbol}` : "—"}
        sub={topLoser ? `${topLoser.changesPercentage.toFixed(2)}%` : undefined}
        icon={TrendingDown}
        trend="down"
        iconClass="text-red-400"
      />

      <KpiCard
        label="Whale Activity"
        value={String(whaleCount)}
        sub={`${whaleTotal} total on record`}
        icon={Waves}
        trend="neutral"
        iconClass="text-blue-400"
      />

      <KpiCard
        label={isCrypto ? "Crypto Watchlist Δ" : "Watchlist Avg Δ"}
        value={portfolioValue !== null ? `${portfolioChange >= 0 ? "+" : ""}${portfolioChange.toFixed(2)}%` : "—"}
        sub={
          stockSymbols.length > 0
            ? `${stockSymbols.length} ${isCrypto ? "coins" : "positions"}`
            : isCrypto
              ? "No crypto"
              : "No stocks"
        }
        icon={BarChart3}
        trend={portfolioChange >= 0 ? "up" : "down"}
        iconClass="text-purple-400"
      />

      <KpiCard
        label="Earnings This Week"
        value={String(earningsCount)}
        sub="upcoming reports"
        icon={CalendarDays}
        trend="neutral"
        iconClass="text-yellow-400"
      />
    </div>
  );
}
