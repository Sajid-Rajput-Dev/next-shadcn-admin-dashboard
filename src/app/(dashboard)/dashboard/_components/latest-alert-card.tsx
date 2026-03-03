"use client";

import Link from "next/link";

import { ArrowRight, Bell, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlertsFeed } from "@/hooks/use-alerts-feed";

export function LatestAlertCard() {
  const { data: alerts, isLoading } = useAlertsFeed();
  const latestAlert = alerts?.data?.[0];

  if (isLoading) {
    return (
      <Card className="col-span-1 flex h-[200px] items-center justify-center border-white/5 bg-card/50">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (!latestAlert) {
    return (
      <Card className="col-span-1 h-[200px] border-white/5 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold text-lg text-white">
            <Bell className="h-5 w-5 text-primary" />
            Latest Intel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent alerts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group col-span-1 border-white/5 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all hover:border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 font-bold text-lg text-white">
          <div className="rounded-md bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          Latest Intel
        </CardTitle>
        <Badge
          variant="outline"
          className={`capitalize ${
            latestAlert.severity === "high"
              ? "border-red-500/50 bg-red-500/10 text-red-500"
              : latestAlert.severity === "medium"
                ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                : "border-primary/50 bg-primary/10 text-primary"
          }
            `}
        >
          {latestAlert.severity} Impact
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground text-lg leading-tight">
              {latestAlert.actor} {latestAlert.action} {latestAlert.symbol}
            </h4>
            <p className="mt-2 line-clamp-2 text-neutral-400 text-sm leading-relaxed">
              Value: {latestAlert.amount_display}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-mono text-neutral-500 text-xs">
              {new Date(latestAlert.event_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-primary hover:bg-primary/10 hover:text-primary/80"
              asChild
            >
              <Link href={`/alerts`}>
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
