"use client";

import { useEffect, useRef } from "react";

import { useThemeStore } from "@/stores/theme-store";

export function StockHeatmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: "SPX500",
      grouping: "sector",
      blockSize: "market_cap_basic",
      blockColor: "change",
      locale: "en",
      symbolUrl: "",
      colorTheme: theme === "light" ? "light" : "dark",
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      width: "100%",
      height: "100%",
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
  }, [theme]);

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-lg border border-border bg-secondary" ref={containerRef} />
  );
}
