import { createClient } from "@/lib/supabase/server";
import { MarketToggle } from "@/components/layout/market-toggle";
import { PortfolioSummary as KpiCards } from "./_components/portfolio-summary";
import { LatestAlertCard } from "./_components/latest-alert-card";
import { StockHeatmap } from "@/components/charts/stock-heatmap";
import { RecentTrades } from "./_components/recent-trades";
import { QuickActions } from "./_components/quick-actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Welcome Header & Market Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split("@")[0] || "Trader"}. Here's your market intelligence briefing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MarketToggle />
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        
        {/* Left Column (Alerts + Heatmap) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col gap-6">
          <LatestAlertCard />
          <div className="flex flex-col gap-2">
             <h3 className="text-lg font-semibold">Market Heatmap</h3>
             <StockHeatmap />
          </div>
        </div>

        {/* Right Column (Trades + Actions) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-6">
          <RecentTrades />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
