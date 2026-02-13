import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MarketType } from "@/lib/utils/constants";

interface MarketStore {
    /** Current market toggle value */
    market: MarketType;
    /** Set the active market */
    setMarket: (market: MarketType) => void;
}

export const useMarketStore = create<MarketStore>()(
    persist(
        (set) => ({
            market: "all",
            setMarket: (market) => set({ market }),
        }),
        {
            name: "capitol-alpha-market",
        },
    ),
);
