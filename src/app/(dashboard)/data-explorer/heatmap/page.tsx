import { Suspense } from "react";

import { StockHeatmap } from "@/components/charts/stock-heatmap";

export default function HeatmapPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Sector Heatmap</h2>
        <p className="text-muted-foreground">
          Visual breakdown of S&amp;P 500 performance grouped by sector and weighted by market cap.
        </p>
      </div>

      <Suspense
        fallback={<div className="h-[400px] w-full animate-pulse rounded-lg border border-border bg-secondary/50" />}
      >
        <StockHeatmap />
      </Suspense>
    </div>
  );
}
