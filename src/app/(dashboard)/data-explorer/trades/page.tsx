import { Suspense } from "react";
import { TradesTable } from "./_components/trades-table";
import { TradeFilters } from "./_components/trade-filters";
import { Loader2 } from "lucide-react";

export default function TradesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Congress Trades</h2>
        <p className="text-muted-foreground">
          Explore and filter real-time trading activity from US Senators and Representatives.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Suspense fallback={<div className="h-16 bg-secondary/50 rounded-lg animate-pulse" />}>
          <TradeFilters />
        </Suspense>

        <Suspense fallback={
          <div className="flex h-[400px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <TradesTable />
        </Suspense>
      </div>
    </div>
  );
}
