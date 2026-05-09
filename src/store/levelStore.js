import { create } from "zustand";

export const useLevelStore = create((set) => ({
  levels: [],
  xpLogs: [],
  isLoadingLevels: false,

  setLevels: (levels) => set({ levels }),
  setXPLogs: (logs) => set({ xpLogs: logs }),
  setIsLoadingLevels: (status) => set({ isLoadingLevels: status }),
}));