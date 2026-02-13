"use client";

import { useState } from "react";
import { Plus, Search, Trash2, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

import { useWatchlist } from "@/hooks/use-watchlist";


export default function WatchlistPage() {
  const { watchlist, isLoading, removeFromWatchlist } = useWatchlist();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWatchlist = (watchlist || []).filter(item =>
    item.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Watchlist</h1>
        <p className="text-muted-foreground">
          Track your favorite assets and get notified of significant movements.
        </p>
      </div>

      <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row md:items-center justify-between gap-4">
           <div>
              <CardTitle className="text-xl font-bold text-white">My Assets</CardTitle>
              <CardDescription>Real-time price updates for your selected assets.</CardDescription>
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                        placeholder="Search symbols..." 
                        className="pl-9 bg-black/40 border-white/10 focus-visible:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                   />
               </div>
               <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                   <Plus className="mr-2 h-4 w-4" /> Add Asset
               </Button>
           </div>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : filteredWatchlist.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-lg bg-white/5">
                    No assets found in your watchlist.
                </div>
             ) : (
                <div className="rounded-md border border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="text-white font-medium">Symbol</TableHead>
                                <TableHead className="text-white font-medium text-right">Price</TableHead>
                                <TableHead className="text-white font-medium text-right">24h Change</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredWatchlist.map((item) => {
                                const price = item.currentPrice || 0;
                                const change = item.priceChange || 0;

                                return (
                                <TableRow key={item.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-base">{item.ticker}</span>
                                            <span className="text-xs text-muted-foreground">{item.asset_type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-base">
                                        {price > 0 ? formatCurrency(price) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {change !== 0 ? (
                                            <Badge 
                                                variant="outline" 
                                                className={`ml-auto w-fit flex items-center gap-1 font-mono
                                                    ${change >= 0 
                                                        ? "border-green-500/30 text-green-500 bg-green-500/10" 
                                                        : "border-red-500/30 text-red-500 bg-red-500/10"}
                                                `}
                                            >
                                                {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                {Math.abs(change)}%
                                            </Badge>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeFromWatchlist({ ticker: item.ticker })}
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}


