import type { ReactNode } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-black p-4 overflow-hidden selection:bg-primary/30 text-foreground">
      {/* Dynamic Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-[450px] flex flex-col items-center gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 transition-transform hover:scale-105"
          >
            <span className="font-bold text-3xl tracking-tight">
               <span className="text-white">Capitol</span> <span className="text-primary">Alpha</span>
            </span>
          </Link>
          <p className="text-muted-foreground text-sm font-medium">
            Institutional-grade market intelligence
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs">
          {APP_CONFIG.copyright} All rights reserved.
        </p>
      </div>
    </main>
  );
}
