"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const title = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { title, href, isLast };
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-black/50 px-4 backdrop-blur-md sticky top-0 z-10 transition-all duration-200">
      <SidebarTrigger className="-ml-1 hover:bg-white/10 hover:text-white" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Capitol <span className="text-gradient-primary">Alpha</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.length > 0 && <BreadcrumbSeparator className="hidden md:block text-muted-foreground/50" />}
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground">{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && <BreadcrumbSeparator className="text-muted-foreground/50" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
