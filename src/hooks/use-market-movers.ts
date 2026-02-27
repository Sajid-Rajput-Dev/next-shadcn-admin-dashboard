import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/utils/constants";
import type { FMPMover } from "@/lib/api/fmp";

export type MoverType = "gainers" | "losers" | "actives";

export function useMarketMovers(type: MoverType = "gainers") {
    return useQuery<{ data: FMPMover[]; type: MoverType; planLimited?: boolean }>({
        queryKey: ["market-movers", type],
        queryFn: async () => {
            const res = await fetch(`/api/stocks/market-movers?type=${type}`);
            if (!res.ok) throw new Error("Failed to fetch market movers");
            return res.json();
        },
        staleTime: STALE_TIME.MARKET_MOVERS,
        refetchInterval: STALE_TIME.MARKET_MOVERS,
    });
}
