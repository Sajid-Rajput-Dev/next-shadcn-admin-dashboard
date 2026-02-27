"use client";

import { useCongressTrades } from "@/hooks/use-congress-trades";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatTradeDate } from "@/lib/utils/format-date";

export function TradesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "0") || 0;
  const filters = {
    ticker: searchParams.get("ticker") || undefined,
    politician: searchParams.get("politician") || undefined,
    party: searchParams.get("party") as any || undefined,
    transactionType: searchParams.get("type") as any || undefined,
    chamber: searchParams.get("chamber") as any || undefined,
  };

  const { data, isLoading, isError } = useCongressTrades(filters, page);

  const trades = data?.data || [];
  const hasMore = data?.hasMore || false;
  const planLimited = data?.planLimited || false;

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 0) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-red-500">
        Failed to load trades. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Politician</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Chamber</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {planLimited
                    ? "Additional pages are not available for this endpoint on the current FMP subscription."
                    : "No trades found."}
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade: any, i: number) => {
                // Handle both FMP field names and DB field names
                const name = trade.politician_name || `${trade.firstName || ''} ${trade.lastName || ''}`.trim() || 'Unknown';
                const type = trade.transaction_type || trade.type || 'Unknown';
                const ticker = trade.ticker || trade.symbol || 'N/A';
                const amount = trade.amount_range || trade.amount || '';
                const date = trade.disclosure_date || trade.disclosureDate || trade.dateRecieved || trade.publication_date;
                const chamber = trade.politician_chamber || trade.chamber || '';
                const party = trade.politician_party || trade.party || '';
                const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{name}</div>
                          {(party || chamber) && (
                            <div className="text-xs text-muted-foreground">
                              {[party, chamber].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {ticker}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={type?.toLowerCase().includes("buy") || type?.toLowerCase().includes("purchase") ? "default" : "secondary"}
                        className={
                          type?.toLowerCase().includes("buy") || type?.toLowerCase().includes("purchase")
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }
                      >
                        {type}
                      </Badge>
                    </TableCell>
                    <TableCell>{amount}</TableCell>
                    <TableCell>{date ? formatTradeDate(date) : '--'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {chamber || '--'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {trades.length} trades</span>
        <span>Page {page + 1}</span>
      </div>

      {(page > 0 || hasMore) && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={!hasMore || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
