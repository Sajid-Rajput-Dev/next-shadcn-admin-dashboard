"use client";

import { useState } from "react";
import { ExternalLink, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInsiderTrades } from "@/hooks/use-insider-trades";
import type { FMPInsiderTrade } from "@/lib/api/fmp";

const POPULAR_SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "META", "GOOGL"];

const TRANSACTION_COLORS: Record<string, string> = {
    P: "text-green-600 dark:text-green-400",
    S: "text-red-600 dark:text-red-400",
    A: "text-blue-600 dark:text-blue-400",
    D: "text-orange-600 dark:text-orange-400",
    F: "text-yellow-600 dark:text-yellow-400",
    G: "text-purple-600 dark:text-purple-400",
    M: "text-cyan-600 dark:text-cyan-400",
};

function InsiderRow({ trade }: { trade: FMPInsiderTrade }) {
    const isBuy = trade.acquistionOrDisposition === "A";
    const typeColor = TRANSACTION_COLORS[trade.transactionType] ?? "text-muted-foreground";

    return (
        <TableRow>
            <TableCell className="font-medium text-sm">{trade.transactionDate}</TableCell>
            <TableCell className="font-mono font-bold">{trade.symbol}</TableCell>
            <TableCell className="max-w-[160px] truncate text-sm">{trade.reportingName}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{trade.typeOfOwner}</TableCell>
            <TableCell className={`font-semibold ${typeColor}`}>
                {trade.transactionType}
            </TableCell>
            <TableCell>
                <Badge variant={isBuy ? "default" : "destructive"} className={`text-xs ${isBuy ? "bg-green-500 hover:bg-green-600" : ""}`}>
                    {isBuy ? "Buy" : "Sell"}
                </Badge>
            </TableCell>
            <TableCell className="text-right text-sm">
                {trade.securitiesTransacted.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-sm">
                {trade.price > 0 ? `$${trade.price.toFixed(2)}` : "—"}
            </TableCell>
            <TableCell className="text-right text-sm">
                {trade.price > 0 && trade.securitiesTransacted > 0
                    ? `$${((trade.price * trade.securitiesTransacted) / 1e6).toFixed(2)}M`
                    : "—"}
            </TableCell>
            <TableCell>
                {trade.link && (
                    <a href={trade.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function InsiderTradesPage() {
    const [symbolInput, setSymbolInput] = useState("AAPL");
    const [activeSymbol, setActiveSymbol] = useState("AAPL");
    const [page, setPage] = useState(0);

    const { data, isLoading, isError } = useInsiderTrades(activeSymbol, { limit: 50, page });

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (symbolInput.trim()) {
            setActiveSymbol(symbolInput.trim().toUpperCase());
            setPage(0);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <Users className="h-6 w-6" />
                    Insider Trades
                </h1>
                <p className="text-muted-foreground text-sm">
                    SEC Form 4 filings — executive and director buy/sell activity.
                </p>
            </div>

            {/* Symbol search */}
            <div className="space-y-2">
                <form className="flex gap-2" onSubmit={handleSearch}>
                    <Input
                        placeholder="Enter ticker symbol..."
                        value={symbolInput}
                        onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                        className="h-9 w-44 font-mono"
                    />
                    <Button type="submit" size="sm">Search</Button>
                </form>
                {/* Quick picks */}
                <div className="flex flex-wrap gap-1">
                    {POPULAR_SYMBOLS.map((sym) => (
                        <Button
                            key={sym}
                            variant={activeSymbol === sym ? "default" : "outline"}
                            size="sm"
                            className="h-7 px-2 font-mono text-xs"
                            onClick={() => {
                                setActiveSymbol(sym);
                                setSymbolInput(sym);
                                setPage(0);
                            }}
                        >
                            {sym}
                        </Button>
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Insider Activity — {activeSymbol}
                        {data?.data && (
                            <Badge variant="secondary" className="ml-2">
                                {data.data.length} filings
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Insider</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Side</TableHead>
                                <TableHead className="text-right">Shares</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                                <TableHead>SEC</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading &&
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 10 }).map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                                        Failed to load insider trades.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && data?.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                                        {data.planLimited
                                            ? "Insider trades are not available on the current FMP plan. Upgrade your FMP subscription to view this section."
                                            : `No insider filings found for ${activeSymbol}.`}
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading &&
                                !isError &&
                                (data?.data as FMPInsiderTrade[])?.map((trade, i) => (
                                    <InsiderRow key={i} trade={trade} />
                                ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {!isLoading && data?.data && data.data.length >= 50 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center text-sm text-muted-foreground">
                                Page {page + 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
