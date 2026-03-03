import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { WhaleRealtimeProvider } from "@/components/shared/whale-realtime-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
      {/* Live whale alert toasts via Supabase Realtime (postgres_changes) */}
      <WhaleRealtimeProvider />
    </SidebarProvider>
  );
}
