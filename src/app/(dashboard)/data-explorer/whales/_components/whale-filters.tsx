"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";

export function WhaleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
  const [minAmount, setMinAmount] = useState(searchParams.get("min_amount") || "");
  
  const debouncedSymbol = useDebounce(symbol, 500);
  const debouncedMinAmount = useDebounce(minAmount, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSymbol) params.set("symbol", debouncedSymbol.toUpperCase());
    else params.delete("symbol");

    if (debouncedMinAmount) params.set("min_amount", debouncedMinAmount);
    else params.delete("min_amount");

    params.set("page", "1");

    router.push(`?${params.toString()}`);
  }, [debouncedSymbol, debouncedMinAmount, router, searchParams]);

  const clearFilters = () => {
    setSymbol("");
    setMinAmount("");
    router.push("?");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-secondary/50 rounded-lg border border-border/50">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
}
