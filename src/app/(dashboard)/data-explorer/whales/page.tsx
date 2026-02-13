import { Suspense } from "react";
import { WhaleTable } from "./_components/whale-table";
import { WhaleFilters } from "./_components/whale-filters";
import { Loader2 } from "lucide-react";

export default function WhalesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Whale Tracker</h2>
        <p className="text-muted-foreground">
           Monitor large cryptocurrency transactions and whale movements in real-time.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Suspense fallback={<div className="h-16 bg-secondary/50 rounded-lg animate-pulse" />}>
          <WhaleFilters />
        </Suspense>

        <Suspense fallback={
          <div className="flex h-[400px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <WhaleTable />
        </Suspense>
      </div>
    </div>
  );
}
