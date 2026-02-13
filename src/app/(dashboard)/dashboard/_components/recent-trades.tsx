"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCongressTrades } from "@/hooks/use-congress-trades";
import { useWhaleTransactions } from "@/hooks/use-whale-transactions";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMarketStore } from "@/stores/market-store";
import { MarketToggle } from "@/components/layout/market-toggle";

export function RecentTrades() {
  const { market } = useMarketStore();
  const { data: congressData, isLoading: isLoadingCongress } = useCongressTrades();
  const { data: whaleData, isLoading: isLoadingWhales } = useWhaleTransactions();

  const isLoading = market === "crypto" ? isLoadingWhales : isLoadingCongress;
  const showCrypto = market === "crypto";
  
  // Normalize data for display
  const trades = showCrypto 
    ? whaleData?.data 
    : congressData?.data;

  return (
    <Card className="col-span-1 lg:col-span-4 border-white/5 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
        <MarketToggle />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !trades?.length ? (
          <div className="p-8 text-center text-muted-foreground">
            No recent trades found.
          </div>
        ) : (
          <div className="relative overflow-x-auto">
             <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-muted-foreground">Entity</TableHead>
                <TableHead className="text-muted-foreground">Asset</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-right text-muted-foreground">Value</TableHead>
                <TableHead className="hidden md:table-cell text-right text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.slice(0, 5).map((trade: any) => {
                 // Adapt different data shapes
                 const isBuy = trade.type === "buy" || trade.transaction_type === "buy" || trade.amount > 0;
                 const amount = trade.amount || trade.value || trade.amount_usd || 0;
                 const date = trade.date || trade.timestamp || trade.transaction_date;
                 const ticker = trade.ticker || trade.token_symbol || trade.symbol;
                 // Safe access for nested properties
                 const entityName = showCrypto 
                    ? `${trade.wallet_address?.slice(0, 4)}...${trade.wallet_address?.slice(-4)}`
                    : trade.politician?.name || "Unknown";
                 
                 return (
                <TableRow key={trade.id || Math.random()} className="group border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={trade.politician?.image_url} alt={entityName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {showCrypto ? "W" : entityName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                            {entityName}
                        </span>
                        {trade.party && (
                             <span className="text-xs text-muted-foreground">{trade.party}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold flex items-center gap-1">
                            {ticker}
                        </span>
                        <span className="text-xs text-muted-foreground">{trade.asset_type || (showCrypto ? "Crypto" : "Stock")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                        variant="outline" 
                        className={`
                            ${isBuy
                                ? "border-green-500/30 text-green-500 bg-green-500/10" 
                                : "border-red-500/30 text-red-500 bg-red-500/10"}
                        `}
                    >
                      {isBuy ? "Buy" : "Sell"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(amount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                    {date ? new Date(date).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
                 );
              })}
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-end">
            <Link 
                href={showCrypto ? "/data-explorer/whales" : "/data-explorer/trades"} 
                className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
                View All Transactions <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
