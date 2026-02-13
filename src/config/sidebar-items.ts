import { LayoutDashboard, Bell, FileText, Settings, LineChart, Database } from "lucide-react";

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
    {
        title: "Data Explorer",
        url: "/data-explorer/trades",
        icon: Database,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];
