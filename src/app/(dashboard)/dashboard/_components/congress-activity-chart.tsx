"use client";

import Link from "next/link";

import { Building2, ExternalLink } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCongressTrades } from "@/hooks/use-congress-trades";
import { cn } from "@/lib/utils";
import { PARTY_COLORS } from "@/lib/utils/constants";

const TYPE_COLORS: Record<string, string> = {
  Purchase: "#22c55e",
  Sale: "#ef4444",
  "Sale (Full)": "#f97316",
  "Sale (Partial)": "#fb923c",
  Exchange: "#a855f7",
};

export function CongressActivityChart() {
  const trades = useCongressTrades(undefined, 0);
  const data = trades.data?.data ?? [];

  // Purchase vs Sale distribution
  const typeCounts = data.reduce<Record<string, number>>((acc, t) => {
    const key = t.type?.includes("Sale") ? "Sale" : (t.type ?? "Other");
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  // Party breakdown
  const partyCounts = data.reduce<Record<string, number>>((acc, t) => {
    // derive party from name pattern - data may not have party directly
    const party = (t as { party?: string }).party ?? "Unknown";
    acc[party] = (acc[party] ?? 0) + 1;
    return acc;
  }, {});

  const recentTrades = data.slice(0, 4);

  return (
    <Card className="flex h-full flex-col border-white/5 bg-card/50">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-400" />
          <CardTitle className="font-semibold text-sm">Congress Activity</CardTitle>
        </div>
        <Link
          href="/dashboard/data-explorer"
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-primary"
        >
          Explore <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pb-4">
        {trades.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Donut chart */}
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: "No Data", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={50}
                    dataKey="value"
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={TYPE_COLORS[entry.name] ?? "#6b7280"} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Party counts */}
            {Object.keys(partyCounts).length > 0 && Object.keys(partyCounts)[0] !== "Unknown" && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(partyCounts).map(([party, count]) => {
                  const colors = PARTY_COLORS[party as keyof typeof PARTY_COLORS];
                  return colors ? (
                    <Badge
                      key={party}
                      variant="outline"
                      className={cn("px-2 py-0.5 text-xs", colors.bg, colors.text, colors.border)}
                    >
                      {party}: {count}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {/* Recent trades */}
            <div className="space-y-1.5">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Recent Trades</p>
              {recentTrades.length === 0 && <p className="text-muted-foreground text-xs">No trades loaded</p>}
              {recentTrades.map((trade, idx) => {
                const isSale = trade.type?.toLowerCase().includes("sale");
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md border-l-2 bg-white/[0.02] px-2 py-1.5",
                      isSale ? "border-l-red-500" : "border-l-green-500",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white text-xs">{trade.symbol || trade.ticker || "—"}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {trade.representative ?? `${trade.firstName ?? ""} ${trade.lastName ?? ""}`.trim()}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn("font-medium text-xs", isSale ? "text-red-400" : "text-green-400")}>
                        {trade.type ?? "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{trade.amount}</p>
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
