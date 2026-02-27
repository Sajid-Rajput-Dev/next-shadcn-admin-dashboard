import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/utils/constants";
import type { FMPEarningsEvent, FMPDividendEvent } from "@/lib/api/fmp";

export type CalendarType = "earnings" | "dividends";

export interface UseCalendarOptions {
    type?: CalendarType;
    from?: string;
    to?: string;
}

export function useEarningsCalendar(options: UseCalendarOptions = {}) {
    const { type = "earnings", from, to } = options;

    return useQuery<{ data: (FMPEarningsEvent | FMPDividendEvent)[]; type: CalendarType; from: string; to: string }>({
        queryKey: ["calendar", type, from, to],
        queryFn: async () => {
            const params = new URLSearchParams({ type });
            if (from) params.set("from", from);
            if (to) params.set("to", to);
            const res = await fetch(`/api/stocks/calendar?${params}`);
            if (!res.ok) throw new Error("Failed to fetch calendar");
            return res.json();
        },
        staleTime: STALE_TIME.EARNINGS_CALENDAR,
    });
}
