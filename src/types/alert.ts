/** Unified alert item from the alerts_feed database view */
export interface AlertItem {
  id: string;
  source: "congress" | "whale";
  actor: string;
  symbol: string;
  action: string;
  amount_display: string;
  event_time: string;
  severity: AlertSeverity;
}

/** Alert severity levels */
export type AlertSeverity = "low" | "medium" | "high" | "critical";

/** Filters for the alerts feed */
export interface AlertFilter {
  source?: "congress" | "whale" | "";
  severity?: AlertSeverity | "";
  symbol?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** Alert statistics for the alerts page KPI cards */
export interface AlertStats {
  total: number;
  highValue: number;
  activeSectors: number;
  newToday: number;
}
