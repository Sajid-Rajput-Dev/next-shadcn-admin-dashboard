import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { WatchlistItem } from "@/types/watchlist";

export function useWatchlist() {
    const queryClient = useQueryClient();

    const { data: watchlist = [], isLoading } = useQuery<WatchlistItem[]>({
        queryKey: ["watchlist"],
        queryFn: async () => {
            const res = await fetch("/api/watchlist");
            if (!res.ok) throw new Error("Failed to fetch watchlist");
            const json = await res.json();
            return json.data || [];
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ ticker, assetType, name }: { ticker: string; assetType: string; name?: string }) => {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticker, assetType, name }),
            });
            if (!res.ok) throw new Error("Failed to add to watchlist");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            toast.success("Added to watchlist");
        },
        onError: () => {
            toast.error("Failed to add to watchlist");
        },
    });

    const removeMutation = useMutation({
        mutationFn: async ({ ticker }: { ticker: string }) => {
            const res = await fetch(`/api/watchlist?ticker=${ticker}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to remove from watchlist");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            toast.success("Removed from watchlist");
        },
        onError: () => {
            toast.error("Failed to remove from watchlist");
        },
    });

    return {
        watchlist,
        isLoading,
        addToWatchlist: mutation.mutate,
        removeFromWatchlist: removeMutation.mutate,
        isAdding: mutation.isPending,
    };
}
