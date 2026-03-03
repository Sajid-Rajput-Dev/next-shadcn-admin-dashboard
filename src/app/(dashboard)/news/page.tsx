"use client";

import { useState } from "react";

import Image from "next/image";

import { ExternalLink, Newspaper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { type NewsType, useMarketNews } from "@/hooks/use-market-news";
import type { FMPNewsArticle } from "@/lib/api/fmp";

const NEWS_TABS: { type: NewsType; label: string }[] = [
  { type: "general", label: "General" },
  { type: "stock", label: "Stocks" },
  { type: "crypto", label: "Crypto" },
  { type: "forex", label: "Forex" },
];

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function NewsCard({ article }: { article: FMPNewsArticle }) {
  const date = new Date(article.publishedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {article.image && (
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image src={article.image} alt={article.title} fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-1 overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-2 font-semibold text-sm leading-snug hover:underline"
              >
                {article.title}
              </a>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">{article.text}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs">{article.site}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">{date}</span>
              {article.symbol && (
                <Badge variant="outline" className="h-4 px-1 font-mono text-xs">
                  {article.symbol}
                </Badge>
              )}
              {article.sentiment && (
                <span
                  className={`rounded-full px-2 py-0.5 font-medium text-xs ${SENTIMENT_COLORS[article.sentiment] || SENTIMENT_COLORS.Neutral}`}
                >
                  {article.sentiment}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewsPage() {
  const [activeType, setActiveType] = useState<NewsType>("general");
  const [symbol, setSymbol] = useState("");
  const [searchSymbol, setSearchSymbol] = useState<string | undefined>(undefined);

  const { data, isLoading, isError } = useMarketNews({
    type: activeType,
    symbol: searchSymbol,
    limit: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-bold text-2xl">
          <Newspaper className="h-6 w-6" />
          Financial News
        </h1>
        <p className="text-muted-foreground text-sm">Latest headlines from FMP — refreshed every 5 minutes.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type tabs */}
        <div className="flex gap-1">
          {NEWS_TABS.map(({ type, label }) => (
            <Button
              key={type}
              variant={activeType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType(type)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Symbol filter */}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearchSymbol(symbol.trim().toUpperCase() || undefined);
          }}
        >
          <Input
            placeholder="Filter by symbol (e.g. AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="h-9 w-44"
          />
          <Button type="submit" size="sm" variant="secondary">
            Go
          </Button>
          {searchSymbol && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSymbol("");
                setSearchSymbol(undefined);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* News list */}
      <div className="grid gap-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="h-20 w-28 rounded-md" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        {isError && (
          <div className="py-12 text-center text-muted-foreground">Failed to load news. Please try again.</div>
        )}
        {!isLoading && !isError && data?.data.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            {data.planLimited
              ? "Financial news is not available on the current FMP plan. Upgrade your FMP subscription to view this section."
              : "No articles found."}
          </div>
        )}
        {!isLoading && !isError && data?.data.map((article, i) => <NewsCard key={i} article={article} />)}
      </div>
    </div>
  );
}
