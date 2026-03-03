"use client";

import Link from "next/link";

import { AlertCircle, AlertTriangle, Bell, CheckCircle, ExternalLink, Info } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertsFeed } from "@/hooks/use-alerts-feed";
import { cn } from "@/lib/utils";
import { SEVERITY_COLORS } from "@/lib/utils/constants";
import type { AlertSeverity } from "@/types/alert";

const SEVERITY_ICON = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: CheckCircle,
} as const;

const PIE_COLORS: Record<AlertSeverity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export function AlertsSummary() {
  const alerts = useAlertsFeed();
  const data = alerts.data?.data ?? [];

  const severityCounts = (["critical", "high", "medium", "low"] as AlertSeverity[]).map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    key: s,
    value: data.filter((a) => a.severity === s).length,
  }));

  const pieData = severityCounts.filter((s) => s.value > 0);
  const recent = data.slice(0, 4);

  return (
    <Card className="flex h-full flex-col border-white/5 bg-card/50">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-orange-400" />
          <CardTitle className="font-semibold text-sm">Alerts Summary</CardTitle>
        </div>
        <Link
          href="/dashboard/alerts"
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-primary"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pb-4">
        {alerts.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Pie + counts side by side */}
            <div className="flex items-center gap-2">
              <div className="h-[100px] w-[100px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: "None", value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={44}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {(pieData.length > 0 ? pieData : [{ name: "None", key: "low" as AlertSeverity, value: 1 }]).map(
                        (entry, idx) => (
                          <Cell
                            key={idx}
                            fill={PIE_COLORS[entry.key as AlertSeverity] ?? "#6b7280"}
                            fillOpacity={0.85}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-1.5">
                {severityCounts.map((s) => (
                  <div
                    key={s.key}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1 text-xs",
                      SEVERITY_COLORS[s.key as AlertSeverity].bg,
                      SEVERITY_COLORS[s.key as AlertSeverity].border,
                      "border",
                    )}
                  >
                    <span className={cn("font-medium", SEVERITY_COLORS[s.key as AlertSeverity].text)}>{s.name}</span>
                    <span className="font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent alerts */}
            <div className="space-y-1.5">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Recent</p>
              {recent.length === 0 && <p className="text-muted-foreground text-xs">No alerts yet</p>}
              {recent.map((alert) => {
                const Icon = SEVERITY_ICON[alert.severity];
                const colors = SEVERITY_COLORS[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-2 rounded-md border-l-2 bg-white/[0.02] p-2",
                      alert.severity === "critical" && "border-l-red-500",
                      alert.severity === "high" && "border-l-orange-500",
                      alert.severity === "medium" && "border-l-yellow-500",
                      alert.severity === "low" && "border-l-green-500",
                    )}
                  >
                    <Icon className={cn("mt-0.5 h-3 w-3 shrink-0", colors.text)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-medium text-white text-xs">{alert.symbol}</span>
                        <Badge
                          variant="outline"
                          className={cn("shrink-0 px-1 py-0 text-[10px]", colors.bg, colors.text, colors.border)}
                        >
                          {alert.source}
                        </Badge>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">{alert.actor}</p>
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
