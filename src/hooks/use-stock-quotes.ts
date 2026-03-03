import { useQuery } from "@tanstack/react-query";

import type { FMPQuote } from "@/lib/api/fmp";
import { STALE_TIME } from "@/lib/utils/constants";

export function useStockQuotes(symbols: string[]) {
  return useQuery<{ quotes: FMPQuote[] }>({
    queryKey: ["stock-quotes", symbols],
    queryFn: async () => {
      if (symbols.length === 0) return { quotes: [] };
      const res = await fetch(`/api/stocks/quotes?symbols=${symbols.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch quotes");
      return res.json();
    },
    enabled: symbols.length > 0,
    staleTime: STALE_TIME.STOCK_QUOTES,
    refetchInterval: STALE_TIME.STOCK_QUOTES,
  });
}
