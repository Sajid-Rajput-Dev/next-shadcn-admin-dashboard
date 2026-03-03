"use client";

import Link from "next/link";

import { CalendarDays, Clock, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEarningsCalendar } from "@/hooks/use-earnings-calendar";
import type { FMPEarningsEvent } from "@/lib/api/fmp";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const then = new Date(`${dateStr}T00:00:00`);
  return Math.round((then.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function EarningsPreview() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 14);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const calendar = useEarningsCalendar({
    type: "earnings",
    from: fmt(today),
    to: fmt(nextWeek),
  });

  const events = ((calendar.data?.data ?? []) as FMPEarningsEvent[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <Card className="flex h-full flex-col border-white/5 bg-card/50">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-purple-400" />
          <CardTitle className="font-semibold text-sm">Upcoming Earnings</CardTitle>
        </div>
        <Link
          href="/dashboard/calendar"
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-primary"
        >
          Calendar <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-1.5 pb-4">
        {calendar.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground text-xs">No earnings in the next 14 days</p>
        ) : (
          events.map((event) => {
            const days = daysUntil(event.date);
            return (
              <div
                key={`${event.symbol}-${event.date}`}
                className="flex items-center gap-3 rounded-md bg-white/[0.02] px-2 py-2 transition-colors hover:bg-white/[0.04]"
              >
                {/* Symbol */}
                <div className="w-14 shrink-0">
                  <p className="font-bold text-white text-xs">{event.symbol}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(event.date)}</p>
                </div>

                {/* Time badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 border-white/10 px-1.5 py-0 text-[10px]",
                    event.time === "bmo"
                      ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                      : event.time === "amc"
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        : "text-muted-foreground",
                  )}
                >
                  <Clock className="mr-0.5 h-2.5 w-2.5" />
                  {event.time === "bmo" ? "Pre-mkt" : event.time === "amc" ? "After-mkt" : (event.time ?? "—")}
                </Badge>

                <div className="flex-1" />

                {/* Days until */}
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 px-1.5 py-0 text-[10px]",
                    days === 0
                      ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                      : days <= 3
                        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                        : "border-white/10 text-muted-foreground",
                  )}
                >
                  {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
