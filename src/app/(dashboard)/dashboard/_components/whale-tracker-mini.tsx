"use client";

import Link from "next/link";

import { BookmarkCheck, BookmarkPlus, ExternalLink, Waves } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useWhaleTransactions } from "@/hooks/use-whale-transactions";
import { cn } from "@/lib/utils";

function formatUsd(val: number | null): string {
  if (val === null) return "—";
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export function WhaleTrackerMini() {
  const whale = useWhaleTransactions({ pageSize: 10 });
  const { isInWatchlist, addToWatchlist } = useWatchlist();
  const data = whale.data?.data ?? [];

  // Build mini chart data from transactions (by timestamp buckets)
  const chartData = data.slice(0, 8).map((t, i) => ({
    i,
    amount: t.amount_usd ?? 0,
    label: t.symbol,
  }));

  const recent = data.slice(0, 4);

  return (
    <Card className="flex h-full flex-col border-white/5 bg-card/50">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-blue-400" />
          <CardTitle className="font-semibold text-sm">Whale Tracker</CardTitle>
        </div>
        <Link
          href="/dashboard/data-explorer"
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-primary"
        >
          Explore <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pb-4">
        {whale.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Mini area chart */}
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="whaleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                    formatter={(v: number) => [formatUsd(v), "Amount"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#whaleGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent whale txns */}
            <div className="space-y-1.5">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Recent Transactions</p>
              {recent.length === 0 && <p className="text-muted-foreground text-xs">No transactions loaded</p>}
              {recent.map((tx) => {
                const isBuy =
                  tx.transaction_type?.toLowerCase().includes("transfer_to") || tx.to_owner_type === "exchange";
                const inList = tx.symbol ? isInWatchlist(tx.symbol, "crypto") : false;
                return (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md border-l-2 bg-white/[0.02] px-2 py-1.5",
                      isBuy ? "border-l-green-500" : "border-l-blue-500",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white text-xs">{tx.symbol}</span>
                        <span className="font-semibold text-blue-400 text-xs">{formatUsd(tx.amount_usd)}</span>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {tx.alert_text ?? `${tx.transaction_type} · ${tx.blockchain}`}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-white/10 px-1.5 py-0 text-[10px] text-muted-foreground"
                    >
                      {tx.blockchain?.toUpperCase().slice(0, 3)}
                    </Badge>
                    {tx.symbol && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 p-0 hover:bg-white/10"
                        title={inList ? "In watchlist" : "Add to watchlist"}
                        onClick={() => {
                          if (!inList) addToWatchlist({ ticker: tx.symbol!, asset_type: "crypto", name: tx.symbol! });
                        }}
                      >
                        {inList ? (
                          <BookmarkCheck className="h-3 w-3 text-primary" />
                        ) : (
                          <BookmarkPlus className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    )}
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
