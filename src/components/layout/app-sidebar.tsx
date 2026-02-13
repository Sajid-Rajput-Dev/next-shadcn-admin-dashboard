"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendingUp, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";


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
import { Separator } from "@/components/ui/separator";
import { NavUser } from "./nav-user";
import { sidebarItems } from "@/config/sidebar-items";
import { APP_CONFIG } from "@/config/app-config";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
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
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-black" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-accent/5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Link href="/dashboard">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="truncate font-bold tracking-tight text-white">
                    <span className="text-foreground">Capitol</span> <span className="text-gradient-primary">Alpha</span>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{APP_CONFIG.description}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <Separator className="bg-white/5 mx-2 my-2 w-auto opacity-50" />

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
                  className={`
                    transition-all duration-200 ease-in-out
                    ${isActive 
                        ? "bg-gradient-primary text-primary-foreground shadow-md shadow-primary/20 font-medium hover:opacity-90 hover:text-white" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon className={isActive ? "text-white" : "text-muted-foreground group-hover:text-white"} />}
                    <span>{item.title}</span>
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
