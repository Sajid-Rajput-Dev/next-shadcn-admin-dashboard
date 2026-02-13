import { useQuery } from "@tanstack/react-query";

import type { WhaleFilter, WhaleTransaction } from "@/types/crypto";

export function useWhaleTransactions(filters?: WhaleFilter, page = 0) {
    return useQuery<{ data: WhaleTransaction[]; total: number }>({
        queryKey: ["whale-transactions", filters, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.pageSize) params.set("limit", filters.pageSize.toString());
            if (filters?.minAmountUsd) params.set("min_amount", filters.minAmountUsd.toString());
            if (filters?.symbol) params.set("symbol", filters.symbol);

            const res = await fetch(`/api/crypto/whales?${params}`);
            if (!res.ok) throw new Error("Failed to fetch whale transactions");
            return res.json();
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}
