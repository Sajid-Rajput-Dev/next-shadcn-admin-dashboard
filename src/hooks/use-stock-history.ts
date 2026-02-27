import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/utils/constants";
import type { FMPHistoricalWrapper } from "@/lib/api/fmp";

export function useStockHistory(
    symbol: string | null,
    from?: string,
    to?: string,
) {
    return useQuery<{ data: FMPHistoricalWrapper }>({
        queryKey: ["stock-history", symbol, from, to],
        queryFn: async () => {
            const params = new URLSearchParams({ symbol: symbol! });
            if (from) params.set("from", from);
            if (to) params.set("to", to);
            const res = await fetch(`/api/stocks/history?${params}`);
            if (!res.ok) throw new Error("Failed to fetch stock history");
            return res.json();
        },
        enabled: !!symbol,
        staleTime: STALE_TIME.STOCK_HISTORY,
    });
}
