"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ThemePreset } from "@/lib/preferences/theme";

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface UserPreferences {
  theme: ThemePreset;
  notifications: NotificationPreferences;
  sidebarOpen: boolean;
}

interface PreferencesStore extends UserPreferences {
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemePreset) => void;
  toggleSidebar: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: "default",
      notifications: {
        email: true,
        push: false,
        sms: false,
      },
      sidebarOpen: true,
      updatePreferences: (newPreferences) => set((state) => ({ ...state, ...newPreferences })),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "capitol-alpha-preferences",
    },
  ),
);
