"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useDebounce } from "../../../../../hooks/use-debounce";

export function TradeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ticker, setTicker] = useState(searchParams.get("ticker") || "");
  const [politician, setPolitician] = useState(searchParams.get("politician") || "");
  const [party, setParty] = useState(searchParams.get("party") || "all");
  const [chamber, setChamber] = useState(searchParams.get("chamber") || "both");

  const debouncedTicker = useDebounce(ticker, 500);
  const debouncedPolitician = useDebounce(politician, 500);

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

    if (debouncedTicker) params.set("ticker", debouncedTicker);
    if (debouncedPolitician) params.set("politician", debouncedPolitician);
    if (party && party !== "all") params.set("party", party);
    if (chamber && chamber !== "both") params.set("chamber", chamber);

    // Use replace (not push) so filter changes don't pile up in browser history.
    router.replace(`?${params.toString()}`);
  }, [debouncedTicker, debouncedPolitician, party, chamber, router]);

  const clearFilters = () => {
    setTicker("");
    setPolitician("");
    setParty("all");
    setChamber("both");
    router.push("?");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-secondary/50 rounded-lg border border-border/50">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Ticker (e.g. NVDA)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Politician"
            value={politician}
            onChange={(e) => setPolitician(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={party} onValueChange={setParty}>
          <SelectTrigger>
            <SelectValue placeholder="Party" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parties</SelectItem>
            <SelectItem value="Democrat">Democrat</SelectItem>
            <SelectItem value="Republican">Republican</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
         <Select value={chamber} onValueChange={setChamber}>
          <SelectTrigger>
            <SelectValue placeholder="Chamber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Both Chambers</SelectItem>
            <SelectItem value="senate">Senate</SelectItem>
            <SelectItem value="house">House</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(ticker || politician || party !== "all" || chamber !== "both") && (
        <Button variant="ghost" onClick={clearFilters} className="px-3">
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
}
