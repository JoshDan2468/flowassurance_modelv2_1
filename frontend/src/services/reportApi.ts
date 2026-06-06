import { api } from "@/services/api";
import type { PredictionInput } from "@/types/prediction";

function toBackendInput(input: PredictionInput): PredictionInput {
  return {
    ...input,
    D_pipe: input.D_pipe / 39.3701,
    insulation: input.insulation >= 50 ? 1 : 0,
  };
}

export async function generateReport(input: PredictionInput): Promise<Blob> {
  const { data } = await api.post<Blob>("/report", toBackendInput(input), {
    responseType: "blob",
  });
  return data;
}
