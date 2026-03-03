import type { ReactNode } from "react";

import Link from "next/link";

import { APP_CONFIG } from "@/config/app-config";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black p-4 text-foreground selection:bg-primary/30">
      {/* Dynamic Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[800px] w-[800px] animate-pulse rounded-full bg-primary/20 opacity-20 blur-[120px]" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-900/10 opacity-20 blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[450px] flex-col items-center gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
            <span className="font-bold text-3xl tracking-tight">
              <span className="text-white">Capitol</span> <span className="text-primary">Alpha</span>
            </span>
          </Link>
          <p className="font-medium text-muted-foreground text-sm">Institutional-grade market intelligence</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs">{APP_CONFIG.copyright} All rights reserved.</p>
      </div>
    </main>
  );
}
