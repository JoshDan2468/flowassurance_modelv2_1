import { create } from "zustand";
import type { PredictionResult } from "@/types/prediction";

interface SimulationState {
  current: PredictionResult | null;
  history: PredictionResult[];
  setResult: (r: PredictionResult) => void;
  clear: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  current: null,
  history: [],
  setResult: (r) =>
    set((s) => ({ current: r, history: [r, ...s.history].slice(0, 25) })),
  clear: () => set({ current: null }),
}));