import { useQuery } from "@tanstack/react-query";

import type { AlertItem } from "@/types/alert";

export function useAlertsFeed(source?: string) {
  return useQuery<{ data: AlertItem[] }>({
    queryKey: ["alerts-feed", source],
    queryFn: async () => {
      const url = source ? `/api/congress/alerts?source=${source}` : "/api/congress/alerts"; // Default endpoint (or create a unified one?)
      // Actually /api/congress/alerts fetches from alerts_feed view which has source column
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000,
  });
}
