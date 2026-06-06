import { useMutation } from "@tanstack/react-query";
import { predict } from "@/services/simulationApi";
import type { PredictionInput } from "@/types/prediction";
import { useSimulationStore } from "@/store/simulation-store";

export function usePredict() {
  const setResult = useSimulationStore((s) => s.setResult);
  return useMutation({
    mutationFn: (input: PredictionInput) => predict(input),
    onSuccess: (data) => setResult(data),
  });
}
