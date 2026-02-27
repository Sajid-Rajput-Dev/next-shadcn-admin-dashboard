import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/utils/constants";
import type { WhaleFilter, WhaleTransaction } from "@/types/crypto";

export function useWhaleTransactions(filters?: WhaleFilter, page = 0) {
    const pageSize = filters?.pageSize ?? 20;
    const offset = page * pageSize;

    return useQuery<{ data: WhaleTransaction[]; total: number; limit: number; offset: number }>({
        queryKey: ["whale-transactions", filters, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("limit", pageSize.toString());
            params.set("offset", offset.toString());

            if (filters?.minAmountUsd) params.set("min_amount", filters.minAmountUsd.toString());
            if (filters?.symbol) params.set("symbol", filters.symbol);
            if (filters?.blockchain) params.set("blockchain", filters.blockchain);
            if (filters?.ownerType) params.set("owner_type", filters.ownerType);
            if (filters?.transactionType) params.set("transaction_type", filters.transactionType);
            if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
            if (filters?.dateTo) params.set("date_to", filters.dateTo);

            const res = await fetch(`/api/crypto/whales?${params}`);
            if (!res.ok) throw new Error("Failed to fetch whale transactions");
            return res.json();
        },
        staleTime: STALE_TIME.WHALE_TRANSACTIONS,
    });
}
