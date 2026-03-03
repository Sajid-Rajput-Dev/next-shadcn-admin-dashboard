"use client";

import { useCallback } from "react";

import { toast } from "sonner";

import { useWhaleRealtime } from "@/hooks/use-whale-realtime";
import type { WhaleTransaction } from "@/types/crypto";

/** Formats a USD value for display (e.g. $142.5M, $3.2B) */
function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getSeverityLabel(amount_usd: number): "critical" | "high" | "medium" | "low" {
  if (amount_usd >= 50_000_000) return "critical";
  if (amount_usd >= 10_000_000) return "high";
  if (amount_usd >= 1_000_000) return "medium";
  return "low";
}

/**
 * Mounts Supabase Realtime listener for whale_transactions.
 * Shows a toast notification for each new whale alert.
 * Should be rendered once inside the dashboard layout.
 */
export function WhaleRealtimeProvider() {
  const handleInsert = useCallback((tx: WhaleTransaction) => {
    const amount = formatUsd(tx.amount_usd ?? 0);
    const severity = getSeverityLabel(tx.amount_usd ?? 0);
    const from = tx.from_owner || tx.from_owner_type || "Unknown";
    const to = tx.to_owner || tx.to_owner_type || "Unknown";
    const label = tx.transaction_type?.charAt(0).toUpperCase() + tx.transaction_type?.slice(1) || "Transfer";

    const message = `🐋 ${label}: ${amount} ${tx.symbol} (${tx.blockchain})`;
    const description = `${from} → ${to}`;

    switch (severity) {
      case "critical":
        toast.error(message, { description, duration: 10_000 });
        break;
      case "high":
        toast.warning(message, { description, duration: 7_000 });
        break;
      default:
        toast.info(message, { description, duration: 5_000 });
    }
  }, []);

  useWhaleRealtime({ onInsert: handleInsert, invalidateCache: true });

  return null;
}
