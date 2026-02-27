import {
    ActivitySquare,
    Bell,
    CalendarDays,
    Database,
    LayoutDashboard,
    LineChart,
    Newspaper,
    Settings,
    TrendingUp,
    Users,
    Waves,
} from "lucide-react";

export const sidebarItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Watchlist",
        url: "/watchlist",
        icon: LineChart,
    },
    {
        title: "Alerts",
        url: "/alerts",
        icon: Bell,
    },
    // ── Data Explorer group ──────────────────────
    {
        title: "Trades Explorer",
        url: "/data-explorer/trades",
        icon: Database,
    },
    {
        title: "Live Whales",
        url: "/data-explorer/whales",
        icon: Waves,
    },
    // ── Market Intelligence (new) ────────────────
    {
        title: "Market Movers",
        url: "/market-movers",
        icon: TrendingUp,
    },
    {
        title: "News",
        url: "/news",
        icon: Newspaper,
    },
    {
        title: "Earnings Calendar",
        url: "/calendar",
        icon: CalendarDays,
    },
    {
        title: "Insider Trades",
        url: "/data-explorer/insider",
        icon: Users,
    },
    {
        title: "Sector Heatmap",
        url: "/data-explorer/heatmap",
        icon: ActivitySquare,
    },
    // ────────────────────────────────────────────
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];

