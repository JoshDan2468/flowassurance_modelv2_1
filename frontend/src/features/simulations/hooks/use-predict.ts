import { useMutation } from "@tanstack/react-query";

import { predict } from "@/features/simulations/services/predictions-api";
import { useSimulationStore } from "@/features/simulations/stores/simulation-store";
import type { PredictionInput } from "@/features/simulations/types/prediction";

export function usePredict() {
  const setResult = useSimulationStore((s) => s.setResult);
  return useMutation({
    mutationFn: (input: PredictionInput) => predict(input),
    onSuccess: (data) => setResult(data),
  });
}
