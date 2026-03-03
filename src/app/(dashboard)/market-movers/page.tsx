"use client";

import { useState } from "react";

import { TrendingDown, TrendingUp, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type MoverType, useMarketMovers } from "@/hooks/use-market-movers";
import type { FMPMover } from "@/lib/api/fmp";

function formatMarketCap(n?: number | null): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function formatVolume(n?: number | null): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

const TABS: { type: MoverType; label: string; icon: React.ReactNode }[] = [
  { type: "gainers", label: "Top Gainers", icon: <TrendingUp className="h-4 w-4" /> },
  { type: "losers", label: "Top Losers", icon: <TrendingDown className="h-4 w-4" /> },
  { type: "actives", label: "Most Active", icon: <Zap className="h-4 w-4" /> },
];

function MoverRow({ mover, type }: { mover: FMPMover; type: MoverType }) {
  const changesPercentage = mover.changesPercentage ?? 0;
  const changeValue = mover.change ?? 0;
  const priceValue = mover.price ?? 0;
  const isPositive = changesPercentage >= 0;
  const changeColor = type === "losers" || !isPositive ? "text-red-500" : "text-green-500";

  return (
    <TableRow>
      <TableCell className="font-bold font-mono">{mover.symbol}</TableCell>
      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{mover.name}</TableCell>
      <TableCell className="text-right font-medium">${priceValue.toFixed(2)}</TableCell>
      <TableCell className={`text-right font-medium ${changeColor}`}>
        {isPositive ? "+" : ""}
        {changesPercentage.toFixed(2)}%
      </TableCell>
      <TableCell className={`text-right ${changeColor}`}>
        {isPositive ? "+" : ""}
        {changeValue.toFixed(2)}
      </TableCell>
      <TableCell className="text-right text-sm">{formatVolume(mover.volume)}</TableCell>
      <TableCell className="text-right text-sm">{formatMarketCap(mover.marketCap)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {mover.exchange}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export default function MarketMoversPage() {
  const [activeTab, setActiveTab] = useState<MoverType>("gainers");
  const { data, isLoading, isError } = useMarketMovers(activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Market Movers</h1>
        <p className="text-muted-foreground text-sm">Real-time top gainers, losers, and most active stocks.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {TABS.map(({ type, label, icon }) => (
          <Button
            key={type}
            variant={activeTab === type ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(type)}
            className="gap-2"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {TABS.find((t) => t.type === activeTab)?.icon}
            {TABS.find((t) => t.type === activeTab)?.label}
            {data?.data && (
              <Badge variant="secondary" className="ml-auto">
                {data.data.length} stocks
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change %</TableHead>
                <TableHead className="text-right">Change $</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead>Exchange</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {isError && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    Failed to load market movers. Please try again.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    {data.planLimited
                      ? "Market movers are not available on the current FMP plan. Upgrade your FMP subscription to view this section."
                      : "No data available."}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                !isError &&
                data?.data.map((mover) => <MoverRow key={mover.symbol} mover={mover} type={activeTab} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
