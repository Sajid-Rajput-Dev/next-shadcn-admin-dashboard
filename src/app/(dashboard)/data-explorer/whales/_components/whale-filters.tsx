"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

export function WhaleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
  const [minAmount, setMinAmount] = useState(searchParams.get("min_amount") || "");

  const debouncedSymbol = useDebounce(symbol, 500);
  const debouncedMinAmount = useDebounce(minAmount, 500);

  // Skip the initial mount — only push URL updates when the user actually changes a filter.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Build params purely from local state — do NOT read searchParams here so
    // this effect doesn't depend on it and cause an infinite navigation loop.
    const params = new URLSearchParams();

    if (debouncedSymbol) params.set("symbol", debouncedSymbol.toUpperCase());
    if (debouncedMinAmount) params.set("min_amount", debouncedMinAmount);

    // Use replace (not push) so filter changes don't pile up in browser history.
    router.replace(`?${params.toString()}`);
  }, [debouncedSymbol, debouncedMinAmount, router]);

  const clearFilters = () => {
    setSymbol("");
    setMinAmount("");
    router.push("?");
  };

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border/50 bg-secondary/50 p-4 md:flex-row">
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Symbol (e.g. BTC)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={minAmount} onValueChange={setMinAmount}>
          <SelectTrigger>
            <SelectValue placeholder="Min Value (USD)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Amount</SelectItem>
            <SelectItem value="1000000">$1M+</SelectItem>
            <SelectItem value="5000000">$5M+</SelectItem>
            <SelectItem value="10000000">$10M+</SelectItem>
            <SelectItem value="50000000">$50M+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(symbol || minAmount) && (
        <Button variant="ghost" onClick={clearFilters} className="px-3">
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
