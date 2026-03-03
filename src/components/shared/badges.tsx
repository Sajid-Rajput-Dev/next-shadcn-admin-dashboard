import type { VariantProps } from "class-variance-authority";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

// Party Badge
interface PartyBadgeProps extends BadgeProps {
  party?: string | null;
}

export function PartyBadge({ party, className, ...props }: PartyBadgeProps) {
  const normalizedParty = party?.toLowerCase() || "";
  const variant = "secondary";

  let styles = "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  if (normalizedParty.includes("democrat")) {
    styles = "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
  } else if (normalizedParty.includes("republican")) {
    styles = "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  }

  return (
    <Badge variant={variant} className={cn(styles, className)} {...props}>
      {party || "Unknown"}
    </Badge>
  );
}

// Severity Badge
interface SeverityBadgeProps extends BadgeProps {
  severity?: string;
}

export function SeverityBadge({ severity, className, ...props }: SeverityBadgeProps) {
  const normalizedSeverity = severity?.toLowerCase() || "low";

  let styles = "bg-secondary text-secondary-foreground";
  if (normalizedSeverity === "critical") {
    styles = "bg-red-500 text-white hover:bg-red-600";
  } else if (normalizedSeverity === "high") {
    styles = "bg-orange-500 text-white hover:bg-orange-600";
  } else if (normalizedSeverity === "medium") {
    styles = "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
  }

  return (
    <Badge className={cn(styles, className)} {...props}>
      {severity?.toUpperCase() || "LOW"}
    </Badge>
  );
}

// Transaction Type Badge
interface TransactionTypeBadgeProps extends BadgeProps {
  type?: string;
}

export function TransactionTypeBadge({ type, className, ...props }: TransactionTypeBadgeProps) {
  const isBuy = type?.toLowerCase().includes("buy") || type?.toLowerCase().includes("purchase");

  const styles = isBuy
    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    : "bg-red-500/10 text-red-500 hover:bg-red-500/20";

  return (
    <Badge variant={isBuy ? "default" : "secondary"} className={cn(styles, className)} {...props}>
      {type || "Unknown"}
    </Badge>
  );
}
