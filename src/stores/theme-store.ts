import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
    theme: "midnight" | "light" | "system";
    setTheme: (theme: "midnight" | "light" | "system") => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: "midnight",
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "capitol-theme-storage",
        },
    ),
);
