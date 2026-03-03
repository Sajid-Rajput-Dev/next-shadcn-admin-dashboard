import { StockHeatmap } from "@/components/charts/stock-heatmap";
import { MarketToggle } from "@/components/layout/market-toggle";
import { createClient } from "@/lib/supabase/server";

import { AlertsSummary } from "./_components/alerts-summary";
import { CongressActivityChart } from "./_components/congress-activity-chart";
import { EarningsPreview } from "./_components/earnings-preview";
import { MarketMoversMini } from "./_components/market-movers-mini";
import { MarketOverviewStrip } from "./_components/market-overview-strip";
import { NewsTicker } from "./_components/news-ticker";
import { QuickNav } from "./_components/quick-nav";
import { WhaleTrackerMini } from "./_components/whale-tracker-mini";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Market Intelligence</h2>
          <p className="text-muted-foreground text-sm">
            Welcome back, <span className="font-medium text-white">{user?.email?.split("@")[0] || "Trader"}</span>.
            Here&apos;s your full briefing.
          </p>
        </div>
        <MarketToggle />
      </div>

      {/* ── Row 1: KPI Strip ────────────────────────────── */}
      <MarketOverviewStrip />

      {/* ── Row 2: Movers + Alerts ──────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <MarketMoversMini />
        </div>
        <div className="lg:col-span-3">
          <AlertsSummary />
        </div>
      </div>

      {/* ── Row 3: Heatmap + Congress ───────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
        <div className="flex flex-col gap-2 lg:col-span-4">
          <p className="px-0.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Sector Heatmap</p>
          <StockHeatmap />
        </div>
        <div className="lg:col-span-3">
          <CongressActivityChart />
        </div>
      </div>

      {/* ── Row 4: News + Whale ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <NewsTicker />
        </div>
        <div className="lg:col-span-3">
          <WhaleTrackerMini />
        </div>
      </div>

      {/* ── Row 5: Earnings + Quick Nav ─────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <EarningsPreview />
        </div>
        <div className="lg:col-span-3">
          {/* Placeholder — fills remaining height */}
          <div className="h-full" />
        </div>
      </div>

      {/* ── Row 6: Quick Nav ────────────────────────────── */}
      <QuickNav />
    </div>
  );
}
