"use client";

import Link from "next/link";

import {
  ActivitySquare,
  Bell,
  CalendarDays,
  Database,
  LayoutDashboard,
  LineChart,
  Newspaper,
  Settings,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Watchlist", href: "/watchlist", icon: LineChart, color: "text-blue-400" },
  { label: "Alerts", href: "/alerts", icon: Bell, color: "text-orange-400" },
  { label: "Trades Explorer", href: "/data-explorer/trades", icon: Database, color: "text-green-400" },
  { label: "Live Whales", href: "/data-explorer/whales", icon: Waves, color: "text-cyan-400" },
  { label: "Market Movers", href: "/market-movers", icon: TrendingUp, color: "text-emerald-400" },
  { label: "News", href: "/news", icon: Newspaper, color: "text-yellow-400" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, color: "text-purple-400" },
  { label: "Insider Trades", href: "/data-explorer/insider", icon: Users, color: "text-pink-400" },
  { label: "Sector Heatmap", href: "/data-explorer/heatmap", icon: ActivitySquare, color: "text-indigo-400" },
  { label: "Settings", href: "/settings", icon: Settings, color: "text-muted-foreground" },
] as const;

export function QuickNav() {
  return (
    <Card className="border-white/5 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-primary" />
          <CardTitle className="font-semibold text-sm">Quick Navigation</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10">
          {NAV_ITEMS.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg px-3 py-3",
                "border border-white/5 bg-white/[0.02]",
                "hover:border-white/10 hover:bg-white/[0.05]",
                "group text-center transition-all",
              )}
            >
              <div className={cn("rounded-lg bg-white/5 p-2 transition-colors group-hover:bg-white/10", color)}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-muted-foreground leading-tight transition-colors group-hover:text-white">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
