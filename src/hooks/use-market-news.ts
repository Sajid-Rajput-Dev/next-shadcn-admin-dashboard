import { useQuery } from "@tanstack/react-query";

import type { FMPNewsArticle } from "@/lib/api/fmp";
import { STALE_TIME } from "@/lib/utils/constants";

export type NewsType = "general" | "stock" | "crypto" | "forex";

export interface UseMarketNewsOptions {
  type?: NewsType;
  symbol?: string;
  limit?: number;
  page?: number;
}

export function useMarketNews(options: UseMarketNewsOptions = {}) {
  const { type = "general", symbol, limit = 20, page = 0 } = options;

  return useQuery<{ data: FMPNewsArticle[]; type: NewsType; page: number; planLimited?: boolean }>({
    queryKey: ["market-news", type, symbol, limit, page],
    queryFn: async () => {
      const params = new URLSearchParams({ type, limit: String(limit), page: String(page) });
      if (symbol) params.set("symbol", symbol);
      const res = await fetch(`/api/stocks/news?${params}`);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    staleTime: STALE_TIME.NEWS,
    refetchInterval: STALE_TIME.NEWS,
  });
}
