"use client";

import { useMemo, useState } from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bitcoin,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  GripVertical,
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Waves,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn, formatCurrency } from "@/lib/utils";
import { useMarketStore } from "@/stores/market-store";
import type { WatchlistItem } from "@/types/watchlist";

import { AddAssetDialog } from "./_components/add-asset-dialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVolume(n: number | null): string {
  if (n === null || n === 0) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatMarketCap(n: number | null): string {
  if (n === null || n === 0) return "—";
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

type SortKey = "ticker" | "currentPrice" | "changePercent" | "volume" | "marketCap";

// ─── Draggable Row ─────────────────────────────────────────────────────────────

function WatchlistRow({
  item,
  onRemove,
  isRemoving,
}: {
  item: WatchlistItem;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners } = useSortable({
    id: item.id,
  });

  const isUp = (item.changePercent ?? 0) >= 0;
  const hasPrice = item.currentPrice !== null && item.currentPrice !== 0;
  const hasChange = item.changePercent !== null;

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group border-white/5 border-b transition-colors hover:bg-white/[0.03]",
        isDragging && "relative z-10 bg-white/5 opacity-70",
      )}
    >
      {/* Drag handle */}
      <td className="w-8 py-3 pl-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground/30 opacity-0 transition-colors hover:text-muted-foreground active:cursor-grabbing group-hover:opacity-100"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      {/* Symbol + name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded border",
              item.asset_type === "crypto"
                ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                : "border-blue-500/20 bg-blue-500/10 text-blue-400",
            )}
          >
            {item.asset_type === "crypto" ? (
              <Bitcoin className="h-4 w-4" />
            ) : (
              <span className="font-bold text-[10px]">{item.ticker.slice(0, 3)}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">{item.ticker}</p>
            <p className="max-w-[140px] truncate text-muted-foreground text-xs">
              {item.displayName ?? item.name ?? item.ticker}
            </p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-3 py-3 text-right font-mono">
        {hasPrice ? (
          <span className="font-semibold text-sm text-white">{formatCurrency(item.currentPrice!)}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>

      {/* 24h Change */}
      <td className="px-3 py-3 text-right">
        {hasChange ? (
          <div
            className={cn(
              "inline-flex items-center gap-0.5 font-mono font-semibold text-sm",
              isUp ? "text-green-400" : "text-red-400",
            )}
          >
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(item.changePercent!).toFixed(2)}%
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>

      {/* Volume */}
      <td className="hidden px-3 py-3 text-right md:table-cell">
        <span className="font-mono text-muted-foreground text-sm">{formatVolume(item.volume)}</span>
      </td>

      {/* Market Cap */}
      <td className="hidden px-3 py-3 text-right lg:table-cell">
        <span className="font-mono text-muted-foreground text-sm">{formatMarketCap(item.marketCap)}</span>
      </td>

      {/* Intelligence badges */}
      <td className="hidden px-3 py-3 xl:table-cell">
        <div className="flex items-center gap-1.5">
          {item.congressTradeCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="cursor-default gap-1 border-blue-500/30 bg-blue-500/10 px-1.5 py-0 text-[10px] text-blue-400 hover:bg-blue-500/20"
                  >
                    <Landmark className="h-2.5 w-2.5" />
                    {item.congressTradeCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {item.congressTradeCount} congress trade{item.congressTradeCount > 1 ? "s" : ""} in last 30 days
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {item.whaleActivityCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="cursor-default gap-1 border-purple-500/30 bg-purple-500/10 px-1.5 py-0 text-[10px] text-purple-400 hover:bg-purple-500/20"
                  >
                    <Waves className="h-2.5 w-2.5" />
                    {item.whaleActivityCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {item.whaleActivityCount} whale transaction{item.whaleActivityCount > 1 ? "s" : ""} in last 7 days
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 pr-3 text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className="h-7 w-7 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          aria-label={`Remove ${item.ticker} from watchlist`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}

// ─── Sort header button ────────────────────────────────────────────────────────

function SortHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: { key: SortKey; direction: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = currentSort.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "flex items-center gap-1 font-medium text-xs transition-colors hover:text-white",
        active ? "text-white" : "text-muted-foreground",
        className,
      )}
    >
      {label}
      <span className="text-muted-foreground/60">
        {active ? (
          currentSort.direction === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3" />
        )}
      </span>
    </button>
  );
}

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no meaningful key
        <tr key={i} className="border-white/5 border-b">
          <td className="w-8 py-3 pl-3">
            <Skeleton className="h-4 w-4" />
          </td>
          <td className="px-3 py-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded" />
              <div>
                <Skeleton className="mb-1 h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </td>
          <td className="px-3 py-3">
            <Skeleton className="ml-auto h-4 w-20" />
          </td>
          <td className="px-3 py-3">
            <Skeleton className="ml-auto h-4 w-16" />
          </td>
          <td className="hidden px-3 py-3 md:table-cell">
            <Skeleton className="ml-auto h-4 w-16" />
          </td>
          <td className="hidden px-3 py-3 lg:table-cell">
            <Skeleton className="ml-auto h-4 w-20" />
          </td>
          <td className="hidden px-3 py-3 xl:table-cell">
            <Skeleton className="h-4 w-12" />
          </td>
          <td className="py-3 pr-3">
            <Skeleton className="ml-auto h-7 w-7 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WatchlistPage() {
  const {
    watchlist,
    isLoading,
    isError,
    refetch,
    removeFromWatchlist,
    reorderWatchlist,
    isRemoving,
    watchlistCount,
    canAddMore,
  } = useWatchlist();
  const { market } = useMarketStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "ticker",
    direction: "asc",
  });

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  // Filter by market mode
  const marketFiltered = useMemo(() => {
    if (market === "stocks") return watchlist.filter((w) => w.asset_type === "stock");
    if (market === "crypto") return watchlist.filter((w) => w.asset_type === "crypto");
    return watchlist;
  }, [watchlist, market]);

  // Filter by search term
  const searchFiltered = useMemo(
    () =>
      marketFiltered.filter(
        (item) =>
          item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.displayName ?? item.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [marketFiltered, searchTerm],
  );

  // Sort
  const sorted = useMemo(() => {
    return [...searchFiltered].sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;
      switch (sort.key) {
        case "ticker":
          aVal = a.ticker;
          bVal = b.ticker;
          break;
        case "currentPrice":
          aVal = a.currentPrice;
          bVal = b.currentPrice;
          break;
        case "changePercent":
          aVal = a.changePercent;
          bVal = b.changePercent;
          break;
        case "volume":
          aVal = a.volume;
          bVal = b.volume;
          break;
        case "marketCap":
          aVal = a.marketCap;
          bVal = b.marketCap;
          break;
        default:
          aVal = a.ticker;
          bVal = b.ticker;
      }
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sort.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sort.direction === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [searchFiltered, sort]);

  function handleSortChange(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "ticker" ? "asc" : "desc" },
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    const ids = watchlist.map((item) => item.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(watchlist, oldIndex, newIndex);
    reorderWatchlist(reordered.map((item, idx) => ({ id: item.id, display_order: idx })));
  }

  // KPI summary values
  const avgChange = useMemo(() => {
    const withChange = watchlist.filter((w) => w.changePercent !== null);
    if (withChange.length === 0) return null;
    return withChange.reduce((sum, w) => sum + (w.changePercent ?? 0), 0) / withChange.length;
  }, [watchlist]);

  const gainers = watchlist.filter((w) => (w.changePercent ?? 0) > 0).length;
  const losers = watchlist.filter((w) => (w.changePercent ?? 0) < 0).length;
  const withCongressSignal = watchlist.filter((w) => w.congressTradeCount > 0).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl text-white tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground text-sm">Track your assets alongside congress trades and whale activity.</p>
      </div>

      {/* KPI summary strip */}
      {!isLoading && watchlist.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-xs">Tracked Assets</p>
              <p className="mt-0.5 font-bold text-white text-xl">
                {watchlistCount}
                <span className="font-normal text-muted-foreground text-xs">/50</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-xs">Avg 24h Change</p>
              <p
                className={cn(
                  "mt-0.5 font-bold font-mono text-xl",
                  avgChange === null ? "text-muted-foreground" : avgChange >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {avgChange === null ? "—" : `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-xs">Gainers / Losers</p>
              <p className="mt-0.5 font-bold text-xl">
                <span className="text-green-400">{gainers}</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-red-400">{losers}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-3">
              <p className="text-muted-foreground text-xs">Congress Signals</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-blue-400" />
                <p
                  className={cn(
                    "font-bold text-xl",
                    withCongressSignal > 0 ? "text-blue-400" : "text-muted-foreground",
                  )}
                >
                  {withCongressSignal}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main table card */}
      <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div>
            <p className="font-bold text-lg text-white">
              My Assets
              {market !== "all" && (
                <Badge variant="outline" className="ml-2 border-white/10 text-[10px] text-muted-foreground capitalize">
                  {market} only
                </Badge>
              )}
            </p>
            <CardDescription className="text-xs">
              Live prices · Congress trades (30d) · Whale activity (7d)
            </CardDescription>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
            <div className="relative w-full md:w-52">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by symbol..."
                className="h-9 border-white/10 bg-black/40 pl-9 text-sm focus-visible:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="h-9 w-9 shrink-0 border border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white"
              aria-label="Refresh prices"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <AddAssetDialog />
          </div>
        </CardHeader>

        <CardContent className="p-0 pb-2">
          {isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="text-muted-foreground text-sm">Failed to load watchlist.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10">
                Try again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-white/5 border-b bg-white/[0.02]">
                    <th className="w-8 py-2.5 pl-3" />
                    <th className="px-3 py-2.5 text-left">
                      <SortHeader label="Symbol" sortKey="ticker" currentSort={sort} onSort={handleSortChange} />
                    </th>
                    <th className="px-3 py-2.5 text-right">
                      <SortHeader
                        label="Price"
                        sortKey="currentPrice"
                        currentSort={sort}
                        onSort={handleSortChange}
                        className="ml-auto"
                      />
                    </th>
                    <th className="px-3 py-2.5 text-right">
                      <SortHeader
                        label="24h %"
                        sortKey="changePercent"
                        currentSort={sort}
                        onSort={handleSortChange}
                        className="ml-auto"
                      />
                    </th>
                    <th className="hidden px-3 py-2.5 text-right md:table-cell">
                      <SortHeader
                        label="Volume"
                        sortKey="volume"
                        currentSort={sort}
                        onSort={handleSortChange}
                        className="ml-auto"
                      />
                    </th>
                    <th className="hidden px-3 py-2.5 text-right lg:table-cell">
                      <SortHeader
                        label="Mkt Cap"
                        sortKey="marketCap"
                        currentSort={sort}
                        onSort={handleSortChange}
                        className="ml-auto"
                      />
                    </th>
                    <th className="hidden px-3 py-2.5 text-left xl:table-cell">
                      <span className="font-medium text-muted-foreground text-xs">Signals</span>
                    </th>
                    <th className="py-2.5 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonRows />
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                          {watchlist.length === 0 ? (
                            <>
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                                <Search className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-white">Your watchlist is empty</p>
                                <p className="mt-1 text-muted-foreground text-xs">
                                  Add stocks or crypto to track live prices and political signals.
                                </p>
                              </div>
                              <AddAssetDialog
                                trigger={
                                  <Button size="sm" className="mt-1 bg-primary hover:bg-primary/90">
                                    Add your first asset
                                  </Button>
                                }
                              />
                            </>
                          ) : (
                            <>
                              <p className="text-muted-foreground text-sm">No assets match your filter.</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchTerm("")}
                                className="text-primary"
                              >
                                Clear filter
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <DndContext
                      collisionDetection={closestCenter}
                      modifiers={[restrictToVerticalAxis]}
                      onDragEnd={handleDragEnd}
                      sensors={sensors}
                    >
                      <SortableContext items={sorted.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        {sorted.map((item) => (
                          <WatchlistRow
                            key={item.id}
                            item={item}
                            onRemove={(id) => removeFromWatchlist({ id })}
                            isRemoving={isRemoving}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!isLoading && watchlist.length > 0 && (
            <div className="flex items-center justify-between border-white/5 border-t px-4 pt-3">
              <div className="flex items-center gap-2">
                {isRemoving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                <span className="text-muted-foreground text-xs">{watchlistCount}/50 assets tracked</span>
                {!canAddMore && (
                  <Badge variant="outline" className="border-yellow-500/30 text-[10px] text-yellow-400">
                    FULL
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground/50 text-xs">Drag to reorder · Prices refresh every 60s</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
