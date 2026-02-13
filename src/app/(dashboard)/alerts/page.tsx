"use client";

import { useState } from "react";
import { AlertCircle, Calendar, Filter, Loader2, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAlertsFeed } from "@/hooks/use-alerts-feed";

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlertsFeed();
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  const filteredAlerts = alerts?.data?.filter(alert => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity) return false;
    // Add source filtering logic if source is available in alert object
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Market Alerts</h1>
        <p className="text-muted-foreground">
          Real-time notifications on significant market movements and insider activity.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              className="pl-9 bg-card/50 border-white/10 focus-visible:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
           <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[140px] bg-card/50 border-white/10">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
           <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[140px] bg-card/50 border-white/10">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="congress">Congress</SelectItem>
              <SelectItem value="senate">Senate</SelectItem>
              <SelectItem value="whales">Crypto Whales</SelectItem>
            </SelectContent>
          </Select>
           <Button variant="outline" size="icon" className="shrink-0 border-white/10 hover:bg-white/5">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center rounded-xl border border-white/5 bg-card/20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAlerts?.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center rounded-xl border border-white/5 bg-card/20 text-muted-foreground">
             No alerts found matching your criteria.
          </div>
        ) : (
          filteredAlerts?.map((alert) => (
            <Card key={alert.id} className="border-white/5 bg-card/50 transition-all hover:bg-card/80 hover:border-primary/20">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg border 
                    ${alert.severity === 'high' ? 'border-red-500/20 bg-red-500/10 text-red-500' : 
                      alert.severity === 'medium' ? 'border-orange-500/20 bg-orange-500/10 text-orange-500' : 
                      'border-blue-500/20 bg-blue-500/10 text-blue-500'}`}>
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-white">
                      {alert.actor} <span className="text-muted-foreground">{alert.action}</span> {alert.symbol}
                    </CardTitle>
                    <time className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(alert.event_time), { addSuffix: true })}
                    </time>
                  </div>
                  <CardDescription className="line-clamp-2">
                    Value: {alert.amount_display}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pl-16 pt-0">
                  <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white/5 text-muted-foreground hover:bg-white/10 border-transparent capitalize">
                        {alert.source}
                      </Badge>
                      <Badge variant="outline" className={`capitalize
                         ${alert.severity === 'high' ? 'border-red-500/30 text-red-500' : 
                           alert.severity === 'medium' ? 'border-orange-500/30 text-orange-500' : 
                           'border-blue-500/30 text-primary'}`}>
                        {alert.severity} Priority
                      </Badge>
                  </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
