"use client";

import { useMemo, useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Bell, Search, ShieldAlert, TrendingUp, Zap } from "lucide-react";

import { SeverityBadge, TransactionTypeBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAlertsFeed } from "@/hooks/use-alerts-feed";
import { SEVERITY_COLORS } from "@/lib/utils/constants";
import type { AlertItem, AlertSeverity } from "@/types/alert";

// ── Severity accent helpers ─────────────────────────────────────

const SEVERITY_LEFT_BORDER: Record<AlertSeverity, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

const SEVERITY_ICON: Record<AlertSeverity, React.ReactNode> = {
  critical: <ShieldAlert className="h-3.5 w-3.5 text-red-500" />,
  high: <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />,
  medium: <Zap className="h-3.5 w-3.5 text-yellow-500" />,
  low: <Bell className="h-3.5 w-3.5 text-green-500" />,
};

// ── KPI card ────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="border-white/5 bg-card/50">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none text-white">{value}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ───────────────────────────────────────────────────

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlertsFeed();
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Derived filtered list
  const filteredAlerts = useMemo(() => {
    if (!alerts?.data) return [];
    const q = search.trim().toLowerCase();
    return alerts.data.filter((a) => {
      if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
      if (filterSource !== "all" && a.source !== filterSource) return false;
      if (q) {
        const haystack = `${a.actor} ${a.action} ${a.symbol} ${a.amount_display}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [alerts?.data, filterSeverity, filterSource, search]);

  // KPI stats computed from the full (unfiltered) dataset
  const stats = useMemo(() => {
    const all = alerts?.data ?? [];
    const today = new Date().toISOString().split("T")[0];
    const highValue = all.filter((a) => a.severity === "high" || a.severity === "critical").length;
    const newToday = all.filter((a) => a.event_time?.startsWith(today)).length;
    const symbols = new Set(all.map((a) => a.symbol));
    return { total: all.length, highValue, newToday, symbols: symbols.size };
  }, [alerts?.data]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* ── Header ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Real-time notifications on significant market movements and insider activity.
        </p>
      </div>

      {/* ── KPI Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Total Alerts"
          value={isLoading ? "—" : stats.total}
          icon={<Bell className="h-4 w-4 text-primary" />}
          accent="bg-primary/10"
        />
        <KpiCard
          label="High Value"
          value={isLoading ? "—" : stats.highValue}
          icon={<AlertTriangle className="h-4 w-4 text-orange-400" />}
          accent="bg-orange-500/10"
        />
        <KpiCard
          label="New Today"
          value={isLoading ? "—" : stats.newToday}
          icon={<TrendingUp className="h-4 w-4 text-green-400" />}
          accent="bg-green-500/10"
        />
        <KpiCard
          label="Active Tickers"
          value={isLoading ? "—" : stats.symbols}
          icon={<Zap className="h-4 w-4 text-yellow-400" />}
          accent="bg-yellow-500/10"
        />
      </div>

      {/* ── Alerts Table Card ─────────────────────────────── */}
      <Card className="border-white/5 bg-card/50">
        <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-white/5 p-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-semibold">
            Recent Alerts
            {!isLoading && (
              <Badge variant="secondary" className="ml-2 tabular-nums">
                {filteredAlerts.length}
              </Badge>
            )}
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 bg-background/50 pl-8 text-sm"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="h-9 w-[130px] bg-background/50 text-sm">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="h-9 w-[130px] bg-background/50 text-sm">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="congress">Congress</SelectItem>
                <SelectItem value="whale">Whale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Loading skeleton */}
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {/* Empty state */}
              {!isLoading && filteredAlerts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No alerts found matching your criteria.
                  </TableCell>
                </TableRow>
              )}

              {/* Data rows */}
              {!isLoading &&
                filteredAlerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className={`border-l-2 border-b border-white/5 transition-colors hover:bg-white/[0.02] ${SEVERITY_LEFT_BORDER[alert.severity]}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {SEVERITY_ICON[alert.severity]}
                        <SeverityBadge severity={alert.severity} className="text-[10px] px-1.5 py-0" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white">{alert.actor}</TableCell>
                    <TableCell>
                      <TransactionTypeBadge type={alert.action} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {alert.symbol}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{alert.amount_display}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize bg-white/5 text-muted-foreground">
                        {alert.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.event_time), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
