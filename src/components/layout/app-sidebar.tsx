"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/config/sidebar-items";
import { useWatchlist } from "@/hooks/use-watchlist";
import { createClient } from "@/lib/supabase/client";

import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { watchlistCount } = useWatchlist();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: "Loading...",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          name: user.email?.split("@")[0] || "User",
          email: user.email || "",
          avatar: "", // Supabase doesn't provide avatar by default unless in metadata
        });
      }
    });
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-white/5 border-r bg-black" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-accent/5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/dashboard">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="truncate font-bold text-white tracking-tight">
                    <span className="text-foreground">Capitol</span>{" "}
                    <span className="text-gradient-primary">Alpha</span>
                  </div>
                  <span className="truncate text-muted-foreground text-xs">{APP_CONFIG.description}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <Separator className="mx-2 my-2 w-auto bg-white/5 opacity-50" />

      <SidebarContent>
        <SidebarMenu className="gap-2 px-2">
          {sidebarItems.map((item: { title: string; url: string; icon?: any }) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={`transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-gradient-primary font-medium text-primary-foreground shadow-md shadow-primary/20 hover:text-white hover:opacity-90"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }
                  `}
                >
                  <Link href={item.url}>
                    {item.icon && (
                      <item.icon className={isActive ? "text-white" : "text-muted-foreground group-hover:text-white"} />
                    )}
                    <span>{item.title}</span>
                    {item.url === "/watchlist" && watchlistCount > 0 && (
                      <Badge
                        variant="outline"
                        className="ml-auto h-4 border-white/20 bg-white/5 px-1.5 py-0 font-normal text-[10px] text-muted-foreground"
                      >
                        {watchlistCount}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail className="hover:bg-primary/20" />
    </Sidebar>
  );
}
