import { useQuery } from "@tanstack/react-query";

import type { CGMarketCoin } from "@/lib/api/coingecko";

export function useCryptoPrices(page = 1, perPage = 20) {
    return useQuery<{ data: CGMarketCoin[] }>({
        queryKey: ["crypto-prices", page, perPage],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
            });
            const res = await fetch(`/api/crypto/prices?${params}`);
            if (!res.ok) throw new Error("Failed to fetch crypto prices");
            return res.json();
        },
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 60 * 1000,
    });
}
