"use client";

import Link from "next/link";

import { Circle, ExternalLink, Newspaper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketNews } from "@/hooks/use-market-news";
import { cn } from "@/lib/utils";
import { useMarketStore } from "@/stores/market-store";

const SENTIMENT_COLORS = {
  Positive: "bg-green-500",
  Negative: "bg-red-500",
  Neutral: "bg-yellow-500",
} as const;

function formatAge(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffM = Math.floor(diffMs / (1000 * 60));
  if (diffH >= 24) return `${Math.floor(diffH / 24)}d ago`;
  if (diffH >= 1) return `${diffH}h ago`;
  return `${diffM}m ago`;
}

export function NewsTicker() {
  const { market } = useMarketStore();
  const newsType = market === "crypto" ? "crypto" : market === "stocks" ? "stock" : "general";
  const news = useMarketNews({ type: newsType, limit: 6 });
  const articles = news.data?.data ?? [];

  return (
    <Card className="bg-card/50 border-white/5 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-yellow-400" />
          <CardTitle className="text-sm font-semibold">
            {market === "crypto" ? "Crypto News" : market === "stocks" ? "Stock News" : "Market News"}
          </CardTitle>
        </div>
        <Link
          href="/dashboard/news"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          All news <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-2 pb-4">
        {news.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-xs text-muted-foreground">No news available</p>
        ) : (
          <div className="space-y-0">
            {articles.map((article, idx) => {
              const sentiment = article.sentiment;
              return (
                <a
                  key={idx}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors"
                >
                  {/* Sentiment dot */}
                  <Circle
                    className={cn(
                      "h-2 w-2 mt-1 shrink-0 fill-current",
                      sentiment ? SENTIMENT_COLORS[sentiment].replace("bg-", "text-") : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{article.site}</span>
                      <span className="text-[10px] text-muted-foreground">{formatAge(article.publishedDate)}</span>
                      {sentiment && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-1 py-0 text-[9px] leading-none",
                            sentiment === "Positive" && "border-green-500/30 bg-green-500/10 text-green-400",
                            sentiment === "Negative" && "border-red-500/30 bg-red-500/10 text-red-400",
                            sentiment === "Neutral" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
                          )}
                        >
                          {sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
