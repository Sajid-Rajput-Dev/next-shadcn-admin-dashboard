import { Suspense } from "react";

import { Loader2 } from "lucide-react";

import { TradeFilters } from "./_components/trade-filters";
import { TradesTable } from "./_components/trades-table";

export default function TradesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Congress Trades</h2>
        <p className="text-muted-foreground">
          Explore and filter real-time trading activity from US Senators and Representatives.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-secondary/50" />}>
          <TradeFilters />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex h-[400px] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <TradesTable />
        </Suspense>
      </div>
    </div>
  );
}
