"use client";

import { useSearchParams } from "next/navigation";

import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWhaleTransactions } from "@/hooks/use-whale-transactions";
import { formatCompact, formatUSD } from "@/lib/utils/format-currency";
import { formatTradeDate } from "@/lib/utils/format-date";

export function WhaleTable() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const filters = {
    symbol: searchParams.get("symbol") || undefined,
    minAmountUsd: parseInt(searchParams.get("min_amount") || "0", 10),
    // ownerType not yet in hook/API but good to have in UI
  };

  const { data, isLoading, isError } = useWhaleTransactions(filters, page);

  const transactions = data?.data || [];
  const hasMore = (data?.total || 0) > page * 20;

  function getPageUrl(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    return `?${params.toString()}`;
  }

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
        Failed to load whale transactions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blockchain</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value (USD)</TableHead>
              <TableHead>Flow</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx, i) => (
                <TableRow key={i}>
                  <TableCell className="capitalize">{tx.blockchain}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {tx.symbol}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCompact(tx.amount)}</TableCell>
                  <TableCell className="font-medium text-green-500">{formatUSD(tx.amount_usd ?? 0)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="max-w-[80px] truncate text-muted-foreground"
                        title={tx.from_owner_type || "Unknown"}
                      >
                        {tx.from_owner_type || "Unknown"}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span
                        className="max-w-[80px] truncate text-muted-foreground"
                        title={tx.to_owner_type || "Unknown"}
                      >
                        {tx.to_owner_type || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatTradeDate(tx.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" disabled={page <= 1} asChild>
          <a href={getPageUrl(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </a>
        </Button>
        <div className="text-muted-foreground text-sm">Page {page}</div>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasMore} // rudimentary check
          asChild
        >
          <a href={getPageUrl(page + 1)}>
            Next
            <ChevronRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
