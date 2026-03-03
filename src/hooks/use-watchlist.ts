import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { STALE_TIME } from "@/lib/utils/constants";
import type { AddToWatchlistPayload, WatchlistItem } from "@/types/watchlist";

export const WATCHLIST_KEY = ["watchlist"] as const;

export function useWatchlist() {
  const queryClient = useQueryClient();

  // ─── Fetch (enriched: live prices + congress/whale signals) ────────────────
  const {
    data: watchlist = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<WatchlistItem[]>({
    queryKey: WATCHLIST_KEY,
    queryFn: async () => {
      const res = await fetch("/api/watchlist/enriched");
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      const json = await res.json();
      return json.data || [];
    },
    staleTime: STALE_TIME.WATCHLIST,
    refetchInterval: 60_000,
  });

  // ─── Add mutation (with optimistic update) ─────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (payload: AddToWatchlistPayload) => {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: payload.ticker,
          asset_type: payload.asset_type,
          name: payload.name,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error || "Failed to add to watchlist");
      }
      return res.json();
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: WATCHLIST_KEY });
      const previous = queryClient.getQueryData<WatchlistItem[]>(WATCHLIST_KEY);
      const optimistic: WatchlistItem = {
        id: `optimistic-${payload.ticker}-${Date.now()}`,
        user_id: "",
        ticker: payload.ticker.toUpperCase(),
        asset_type: payload.asset_type,
        name: payload.name,
        added_at: new Date().toISOString(),
        display_order: 9999,
        currentPrice: null,
        changePercent: null,
        change: null,
        dayHigh: null,
        dayLow: null,
        volume: null,
        marketCap: null,
        displayName: payload.name,
        congressTradeCount: 0,
        whaleActivityCount: 0,
      };
      queryClient.setQueryData<WatchlistItem[]>(WATCHLIST_KEY, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(WATCHLIST_KEY, context.previous);
      toast.error(err instanceof Error ? err.message : "Failed to add to watchlist");
    },
    onSuccess: (_data, payload) => {
      toast.success(`${payload.ticker.toUpperCase()} added to watchlist`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY });
    },
  });

  // ─── Remove mutation (with optimistic update) ──────────────────────────────
  const removeMutation = useMutation({
    mutationFn: async ({ id, ticker }: { id?: string; ticker?: string }) => {
      const param = id ? `id=${encodeURIComponent(id)}` : `ticker=${encodeURIComponent(ticker ?? "")}`;
      const res = await fetch(`/api/watchlist?${param}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error || "Failed to remove from watchlist");
      }
      return res.json();
    },
    onMutate: async ({ id, ticker }) => {
      await queryClient.cancelQueries({ queryKey: WATCHLIST_KEY });
      const previous = queryClient.getQueryData<WatchlistItem[]>(WATCHLIST_KEY);
      queryClient.setQueryData<WatchlistItem[]>(WATCHLIST_KEY, (old) =>
        (old ?? []).filter((item) => (id ? item.id !== id : item.ticker !== ticker?.toUpperCase())),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(WATCHLIST_KEY, context.previous);
      toast.error("Failed to remove from watchlist");
    },
    onSuccess: () => {
      toast.success("Removed from watchlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY });
    },
  });

  // ─── Reorder mutation ──────────────────────────────────────────────────────
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      const res = await fetch("/api/watchlist/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to reorder watchlist");
      return res.json();
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: WATCHLIST_KEY });
      const previous = queryClient.getQueryData<WatchlistItem[]>(WATCHLIST_KEY);
      queryClient.setQueryData<WatchlistItem[]>(WATCHLIST_KEY, (old) => {
        if (!old) return old;
        const orderMap = new Map(items.map((i) => [i.id, i.display_order]));
        return [...old].sort(
          (a, b) => (orderMap.get(a.id) ?? a.display_order ?? 0) - (orderMap.get(b.id) ?? b.display_order ?? 0),
        );
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(WATCHLIST_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_KEY });
    },
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const watchlistSet = useMemo(
    () => new Set(watchlist.map((item) => `${item.ticker}:${item.asset_type}`)),
    [watchlist],
  );

  function isInWatchlist(ticker: string, assetType?: "stock" | "crypto"): boolean {
    const t = ticker.toUpperCase();
    if (assetType) return watchlistSet.has(`${t}:${assetType}`);
    return watchlistSet.has(`${t}:stock`) || watchlistSet.has(`${t}:crypto`);
  }

  function getWatchlistItem(ticker: string, assetType?: "stock" | "crypto"): WatchlistItem | undefined {
    const t = ticker.toUpperCase();
    return watchlist.find((item) => item.ticker === t && (!assetType || item.asset_type === assetType));
  }

  return {
    watchlist,
    isLoading,
    isError,
    refetch,
    // Mutations
    addToWatchlist: addMutation.mutate,
    removeFromWatchlist: removeMutation.mutate,
    reorderWatchlist: reorderMutation.mutate,
    // States
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    // Helpers
    isInWatchlist,
    getWatchlistItem,
    watchlistCount: watchlist.length,
    canAddMore: watchlist.length < 50,
  };
}
