import { useQuery } from "@tanstack/react-query";

import type { FMPInsiderStats, FMPInsiderTrade } from "@/lib/api/fmp";
import { STALE_TIME } from "@/lib/utils/constants";

export function useInsiderTrades(symbol: string | null, options?: { limit?: number; page?: number }) {
  const { limit = 50, page = 0 } = options || {};

  return useQuery<{ data: FMPInsiderTrade[]; symbol: string; page: number; planLimited?: boolean }>({
    queryKey: ["insider-trades", symbol, limit, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        symbol: symbol!,
        limit: String(limit),
        page: String(page),
      });
      const res = await fetch(`/api/stocks/insider-trades?${params}`);
      if (!res.ok) throw new Error("Failed to fetch insider trades");
      return res.json();
    },
    enabled: !!symbol,
    staleTime: STALE_TIME.INSIDER_TRADES,
  });
}

export function useInsiderTradeStats(symbol: string | null) {
  return useQuery<{ stats: FMPInsiderStats[]; planLimited?: boolean }>({
    queryKey: ["insider-trade-stats", symbol],
    queryFn: async () => {
      const params = new URLSearchParams({ symbol: symbol!, stats: "true" });
      const res = await fetch(`/api/stocks/insider-trades?${params}`);
      if (!res.ok) throw new Error("Failed to fetch insider trade stats");
      return res.json();
    },
    enabled: !!symbol,
    staleTime: STALE_TIME.INSIDER_TRADES,
  });
}
