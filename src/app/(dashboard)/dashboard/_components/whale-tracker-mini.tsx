"use client";

import Link from "next/link";

import { ExternalLink, Waves } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const data = whale.data?.data ?? [];

  // Build mini chart data from transactions (by timestamp buckets)
  const chartData = data.slice(0, 8).map((t, i) => ({
    i,
    amount: t.amount_usd ?? 0,
    label: t.symbol,
  }));

  const recent = data.slice(0, 4);

  return (
    <Card className="bg-card/50 border-white/5 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Waves className="h-4 w-4 text-blue-400" />
          <CardTitle className="text-sm font-semibold">Whale Tracker</CardTitle>
        </div>
        <Link
          href="/dashboard/data-explorer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          Explore <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pb-4">
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
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recent Transactions</p>
              {recent.length === 0 && <p className="text-xs text-muted-foreground">No transactions loaded</p>}
              {recent.map((tx) => {
                const isBuy =
                  tx.transaction_type?.toLowerCase().includes("transfer_to") || tx.to_owner_type === "exchange";
                return (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] border-l-2",
                      isBuy ? "border-l-green-500" : "border-l-blue-500",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{tx.symbol}</span>
                        <span className="text-xs font-semibold text-blue-400">{formatUsd(tx.amount_usd)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {tx.alert_text ?? `${tx.transaction_type} · ${tx.blockchain}`}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-white/10 text-muted-foreground shrink-0"
                    >
                      {tx.blockchain?.toUpperCase().slice(0, 3)}
                    </Badge>
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
