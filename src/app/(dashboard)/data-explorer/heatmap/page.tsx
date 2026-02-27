import { Suspense } from "react";
import { StockHeatmap } from "@/components/charts/stock-heatmap";

export default function HeatmapPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sector Heatmap</h2>
        <p className="text-muted-foreground">
          Visual breakdown of S&amp;P 500 performance grouped by sector and weighted by market cap.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-[400px] w-full bg-secondary/50 rounded-lg animate-pulse border border-border" />
        }
      >
        <StockHeatmap />
      </Suspense>
    </div>
  );
}
