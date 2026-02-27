"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEarningsCalendar, type CalendarType } from "@/hooks/use-earnings-calendar";
import type { FMPEarningsEvent, FMPDividendEvent } from "@/lib/api/fmp";

function getDateRange(weeks: number): { from: string; to: string } {
    const today = new Date();
    const to = new Date(today);
    to.setDate(to.getDate() + weeks * 7);
    return {
        from: today.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
    };
}

function formatNumber(n: number | null): string {
    if (n === null || n === undefined) return "—";
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return n.toFixed(2);
}

function EarningsRow({ event }: { event: FMPEarningsEvent }) {
    const beat =
        event.eps !== null && event.epsEstimated !== null
            ? event.eps >= event.epsEstimated
            : null;

    return (
        <TableRow>
            <TableCell className="font-medium">{event.date}</TableCell>
            <TableCell className="font-mono font-bold">{event.symbol}</TableCell>
            <TableCell>
                <Badge variant="outline" className="text-xs">{event.time}</Badge>
            </TableCell>
            <TableCell className="text-right">{event.eps?.toFixed(2) ?? "—"}</TableCell>
            <TableCell className="text-right text-muted-foreground">{event.epsEstimated?.toFixed(2) ?? "—"}</TableCell>
            <TableCell className="text-right">
                {beat !== null && (
                    <Badge
                        variant={beat ? "default" : "destructive"}
                        className={`text-xs ${beat ? "bg-green-500 hover:bg-green-600" : ""}`}
                    >
                        {beat ? "Beat" : "Miss"}
                    </Badge>
                )}
            </TableCell>
            <TableCell className="text-right">{formatNumber(event.revenue)}</TableCell>
            <TableCell className="text-right text-muted-foreground">{formatNumber(event.revenueEstimated)}</TableCell>
        </TableRow>
    );
}

function DividendRow({ event }: { event: FMPDividendEvent }) {
    return (
        <TableRow>
            <TableCell className="font-medium">{event.date}</TableCell>
            <TableCell className="font-mono font-bold">{event.symbol}</TableCell>
            <TableCell className="text-right">${event.dividend.toFixed(4)}</TableCell>
            <TableCell className="text-right">${event.adjDividend.toFixed(4)}</TableCell>
            <TableCell>{event.recordDate}</TableCell>
            <TableCell>{event.paymentDate}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{event.declarationDate}</TableCell>
        </TableRow>
    );
}

export default function CalendarPage() {
    const [type, setType] = useState<CalendarType>("earnings");
    const [weeks, setWeeks] = useState(2);
    const range = getDateRange(weeks);

    const { data, isLoading, isError } = useEarningsCalendar({ type, ...range });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <CalendarDays className="h-6 w-6" />
                    {type === "earnings" ? "Earnings Calendar" : "Dividends Calendar"}
                </h1>
                <p className="text-muted-foreground text-sm">
                    Upcoming earnings releases and dividend payments.
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                    {(["earnings", "dividends"] as CalendarType[]).map((t) => (
                        <Button
                            key={t}
                            variant={type === t ? "default" : "outline"}
                            size="sm"
                            onClick={() => setType(t)}
                            className="capitalize"
                        >
                            {t}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-1">
                    {[1, 2, 4].map((w) => (
                        <Button
                            key={w}
                            variant={weeks === w ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setWeeks(w)}
                        >
                            {w}w
                        </Button>
                    ))}
                </div>
                <span className="text-xs text-muted-foreground">
                    {range.from} → {range.to}
                </span>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base capitalize">
                        {type} Calendar
                        {data?.data && (
                            <Badge variant="secondary" className="ml-2">
                                {data.data.length} events
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        {type === "earnings" ? (
                            <>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead className="text-right">EPS</TableHead>
                                        <TableHead className="text-right">EPS Est.</TableHead>
                                        <TableHead className="text-right">Result</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Rev. Est.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading &&
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 8 }).map((_, j) => (
                                                    <TableCell key={j}>
                                                        <Skeleton className="h-4 w-full" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    {isError && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                                                Failed to load calendar data.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading &&
                                        !isError &&
                                        (data?.data as FMPEarningsEvent[])?.map((ev, i) => (
                                            <EarningsRow key={i} event={ev} />
                                        ))}
                                </TableBody>
                            </>
                        ) : (
                            <>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ex-Div Date</TableHead>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead className="text-right">Dividend</TableHead>
                                        <TableHead className="text-right">Adj. Dividend</TableHead>
                                        <TableHead>Record Date</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead>Declaration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading &&
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 7 }).map((_, j) => (
                                                    <TableCell key={j}>
                                                        <Skeleton className="h-4 w-full" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    {isError && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                                Failed to load calendar data.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading &&
                                        !isError &&
                                        (data?.data as FMPDividendEvent[])?.map((ev, i) => (
                                            <DividendRow key={i} event={ev} />
                                        ))}
                                </TableBody>
                            </>
                        )}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
