"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import type { WhaleTransaction } from "@/types/crypto";

export interface WhaleRealtimeEvent {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: WhaleTransaction;
    old: Partial<WhaleTransaction>;
}

export interface UseWhaleRealtimeOptions {
    /** Called whenever a new whale transaction is inserted */
    onInsert?: (tx: WhaleTransaction) => void;
    /** Whether to automatically invalidate the whale-transactions query cache */
    invalidateCache?: boolean;
}

/**
 * Subscribes to Supabase Realtime postgres_changes on whale_transactions.
 * Enables live updates without polling — powered by the Supabase Realtime channel.
 *
 * Requirements:
 *  - `whale_transactions` must be in the supabase_realtime publication
 *    (see migration: 20250101_whale_transactions_v2.sql)
 */
export function useWhaleRealtime(options: UseWhaleRealtimeOptions = {}) {
    const { onInsert, invalidateCache = true } = options;
    const queryClient = useQueryClient();
    const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel("whale-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "whale_transactions",
                },
                (payload: { new: WhaleTransaction }) => {
                    const tx = payload.new as WhaleTransaction;

                    // Notify listener (e.g. for toasts)
                    onInsert?.(tx);

                    // Invalidate TanStack Query cache so tables/lists refresh
                    if (invalidateCache) {
                        queryClient.invalidateQueries({ queryKey: ["whale-transactions"] });
                    }
                },
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [onInsert, invalidateCache, queryClient]);
}
