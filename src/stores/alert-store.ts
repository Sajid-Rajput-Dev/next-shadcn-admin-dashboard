import { create } from "zustand";

import type { AlertItem } from "@/types/alert";

interface AlertStore {
    alerts: AlertItem[];
    hasNewAlerts: boolean;
    addAlert: (alert: AlertItem) => void;
    markAsRead: () => void;
    clearAlerts: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
    alerts: [],
    hasNewAlerts: false,
    addAlert: (alert) =>
        set((state) => ({
            alerts: [alert, ...state.alerts].slice(0, 50), // Keep last 50
            hasNewAlerts: true,
        })),
    markAsRead: () => set({ hasNewAlerts: false }),
    clearAlerts: () => set({ alerts: [], hasNewAlerts: false }),
}));
