"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Bitcoin, CheckCircle2, Loader2, Plus, Search, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { TickerSearchResult } from "@/types/watchlist";

interface SearchResponse {
  stocks: TickerSearchResult[];
  cryptos: TickerSearchResult[];
}

interface AddAssetDialogProps {
  /** Custom trigger element. Defaults to a primary "Add Asset" button. */
  trigger?: React.ReactNode;
}

export function AddAssetDialog({ trigger }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { addToWatchlist, isAdding, isInWatchlist, canAddMore, watchlistCount } = useWatchlist();

  // ─── Search query ──────────────────────────────────────────────────────────
  const { data, isLoading: isSearching } = useQuery<SearchResponse>({
    queryKey: ["ticker-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) return { stocks: [], cryptos: [] };
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 60_000,
  });

  const stocks = data?.stocks ?? [];
  const cryptos = data?.cryptos ?? [];
  const hasResults = stocks.length > 0 || cryptos.length > 0;

  function handleAdd(result: TickerSearchResult) {
    if (!canAddMore) return;
    addToWatchlist({
      ticker: result.ticker,
      asset_type: result.asset_type,
      name: result.name,
      coinId: result.coinId,
    });
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-card p-0 sm:max-w-[480px]">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-white">Add Asset to Watchlist</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search for stocks or crypto. {watchlistCount}/50 slots used.
          </DialogDescription>
        </DialogHeader>

        {!canAddMore && (
          <div className="mx-4 mb-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
            Watchlist is full (50/50). Remove an asset to add a new one.
          </div>
        )}

        <Command className="border-0 bg-transparent" shouldFilter={false}>
          <div className="px-2 pb-1">
            <CommandInput
              placeholder="Search ticker or company name..."
              value={query}
              onValueChange={setQuery}
              className="border-white/10 bg-black/40 text-white placeholder:text-muted-foreground"
              disabled={!canAddMore}
            />
          </div>

          <CommandList className="max-h-[340px] px-2 pb-2">
            {/* Loading state */}
            {isSearching && debouncedQuery && (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            )}

            {/* Empty state */}
            {!isSearching && debouncedQuery && !hasResults && (
              <CommandEmpty className="py-6 text-center text-muted-foreground text-sm">
                No results for &ldquo;{debouncedQuery}&rdquo;
              </CommandEmpty>
            )}

            {/* Prompt when no query */}
            {!debouncedQuery && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-30" />
                Type a ticker symbol or company name
              </div>
            )}

            {/* Stock results */}
            {stocks.length > 0 && (
              <CommandGroup
                heading={
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-blue-400" />
                    Stocks &amp; ETFs
                  </span>
                }
              >
                {stocks.map((result) => {
                  const already = isInWatchlist(result.ticker, "stock");
                  return (
                    <CommandItem
                      key={`stock-${result.ticker}`}
                      value={`${result.ticker} ${result.name}`}
                      onSelect={() => !already && handleAdd(result)}
                      disabled={already || !canAddMore || isAdding}
                      className="flex cursor-pointer items-center justify-between gap-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-blue-500/20 bg-blue-500/10">
                          <span className="font-bold text-[10px] text-blue-400">{result.ticker.slice(0, 3)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-sm text-white">{result.ticker}</p>
                          <p className="truncate text-muted-foreground text-xs">{result.name}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {result.exchange && (
                          <Badge
                            variant="outline"
                            className="h-4 border-white/10 px-1 text-[10px] text-muted-foreground"
                          >
                            {result.exchange}
                          </Badge>
                        )}
                        {already ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground opacity-60" />
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {stocks.length > 0 && cryptos.length > 0 && <CommandSeparator className="bg-white/5" />}

            {/* Crypto results */}
            {cryptos.length > 0 && (
              <CommandGroup
                heading={
                  <span className="flex items-center gap-1.5">
                    <Bitcoin className="h-3 w-3 text-orange-400" />
                    Crypto
                  </span>
                }
              >
                {cryptos.map((result) => {
                  const already = isInWatchlist(result.ticker, "crypto");
                  return (
                    <CommandItem
                      key={`crypto-${result.ticker}`}
                      value={`${result.ticker} ${result.name}`}
                      onSelect={() => !already && handleAdd(result)}
                      disabled={already || !canAddMore || isAdding}
                      className="flex cursor-pointer items-center justify-between gap-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-orange-500/20 bg-orange-500/10">
                          <Bitcoin className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-sm text-white">{result.ticker}</p>
                          <p className="truncate text-muted-foreground text-xs">{result.name}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-4 border-orange-500/20 bg-orange-500/5 px-1 text-[10px] text-orange-400"
                        >
                          CRYPTO
                        </Badge>
                        {already ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground opacity-60" />
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
