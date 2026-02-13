import { useQuery } from "@tanstack/react-query";

import type { FMPSectorPerformance } from "@/lib/api/fmp";

export function useHeatmapData() {
    return useQuery<{ data: FMPSectorPerformance[] }>({
        queryKey: ["heatmap-data"],
        queryFn: async () => {
            const res = await fetch("/api/stocks/heatmap");
            if (!res.ok) throw new Error("Failed to fetch heatmap data");
            return res.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
