import {
  Bell,
  Bookmark,
  ChartCandlestick,
  Fish,
  Landmark,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Alerts",
        url: "/alerts",
        icon: Bell,
        isNew: true,
      },
    ],
  },
  {
    id: 2,
    label: "Data Explorer",
    items: [
      {
        title: "Congress Trades",
        url: "/data-explorer/trades",
        icon: Landmark,
      },
      {
        title: "Politicians",
        url: "/data-explorer/politicians",
        icon: Users,
      },
      {
        title: "Whale Tracker",
        url: "/data-explorer/whales",
        icon: Fish,
      },
      {
        title: "Market Data",
        url: "/data-explorer/market",
        icon: ChartCandlestick,
        comingSoon: true,
      },
    ],
  },
  {
    id: 3,
    label: "Personal",
    items: [
      {
        title: "Watchlist",
        url: "/watchlist",
        icon: Bookmark,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];
