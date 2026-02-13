"use client";

import { Button } from "@/components/ui/button";
import { useMarketStore } from "@/stores/market-store";
import { cn } from "@/lib/utils";

export function MarketToggle() {
  const { market, setMarket } = useMarketStore();

  return (
    <div className="flex items-center rounded-lg border border-white/5 bg-black/40 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMarket("stocks")}
        className={cn(
          "h-7 rounded-md px-3 text-xs font-medium transition-all",
          market === "stocks"
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        Stocks
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMarket("crypto")}
         className={cn(
          "h-7 rounded-md px-3 text-xs font-medium transition-all",
          market === "crypto"
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        Crypto
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMarket("all")}
         className={cn(
          "h-7 rounded-md px-3 text-xs font-medium transition-all",
          market === "all"
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        All
      </Button>
    </div>
  );
}
