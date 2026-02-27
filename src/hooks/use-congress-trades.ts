import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/utils/constants";
import type { CongressTrade, TradeFilter } from "@/types/congress";

export function useCongressTrades(filters?: TradeFilter, page = 0) {
    return useQuery<{ data: CongressTrade[]; hasMore: boolean; page: number; planLimited?: boolean }>({
        queryKey: ["congress-trades", filters, page],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
            });
            if (filters?.politician) params.set("politician", filters.politician);
            if (filters?.party) params.set("party", filters.party);
            if (filters?.ticker) params.set("ticker", filters.ticker);
            if (filters?.transactionType) params.set("type", filters.transactionType);
            if (filters?.chamber) params.set("chamber", filters.chamber);

            const res = await fetch(`/api/congress/trades?${params}`);
            if (!res.ok) throw new Error("Failed to fetch trades");
            return res.json();
        },
        staleTime: STALE_TIME.CONGRESS_TRADES,
    });
}
