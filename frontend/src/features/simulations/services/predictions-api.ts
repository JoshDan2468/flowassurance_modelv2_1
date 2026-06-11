import axios from "axios";

import { mockPredict } from "@/features/simulations/services/demo-prediction";
import type {
  OpsStatus,
  PredictionInput,
  PredictionResult,
  RiskItem,
  RiskLevel,
} from "@/features/simulations/types/prediction";

export const API_BASE_URL = (
  import.meta.env.VITE_FAIP_API_URL?.trim() || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const predictionsApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export function isBackendConfigured() {
  return Boolean(API_BASE_URL);
}

type BackendPredictResult = {
  classification: number;
  severity: number;
  risk_level: RiskLevel;
  operational_status: string;
  physics: {
    max_subcooling: number;
    hydrate_flag: boolean;
  };
  transient: {
    time: number[];
    temperature_profile: number[];
    hydrate_equilibrium: number;
    max_subcooling: number;
    min_temperature: number;
  };
  insights: string[];
  observations: string[];
  recommendations: string[];
};

export type ShutdownAnalysisResult = {
  shutdown_profile: Array<{
    shutdown_time: number;
    risk: RiskLevel;
    subcooling: number;
  }>;
  operating_window: {
    safe_shutdown_hours: number;
    caution_start: number;
    critical_after: number;
  };
};

function toBackendInput(input: PredictionInput): PredictionInput {
  return {
    ...input,
    D_pipe: input.D_pipe / 39.3701,
    insulation: input.insulation >= 50 ? 1 : 0,
  };
}

function levelFor(score: number): RiskLevel {
  if (score < 0.34) return "LOW";
  if (score < 0.67) return "MEDIUM";
  return "HIGH";
}

function risk(label: string, probability: number, level = levelFor(probability)): RiskItem {
  return {
    label,
    probability: Math.max(0, Math.min(1, probability)),
    level,
  };
}

function operationalStatus(level: RiskLevel, score: number): OpsStatus {
  if (level === "HIGH") return score > 0.85 ? "CRITICAL" : "WARNING";
  if (level === "MEDIUM") return "MONITOR";
  return "SAFE";
}

function fromBackendResult(input: PredictionInput, data: BackendPredictResult): PredictionResult {
  const score = Math.max(0, Math.min(1, data.severity));
  const hydrateLevel = data.risk_level ?? levelFor(score);
  const temperatureProfile = data.transient.temperature_profile ?? [];
  const minimumTemperature =
    data.transient.min_temperature ??
    temperatureProfile[temperatureProfile.length - 1] ??
    input.T_inlet;

  return {
    id: `SIM-${Date.now().toString(36).toUpperCase()}`,
    created_at: new Date().toISOString(),
    input,
    risks: {
      hydrate: risk("Hydrate Formation Risk", score, hydrateLevel),
      wax: risk("Wax Deposition Risk", input.wax_content / 60),
      asphaltene: risk("Asphaltene Deposition Risk", input.asphaltene_index / 10),
      slug: risk("Slugging Risk", input.Q_gas / (input.Q_oil + input.Q_water + 1) / 3),
      corrosion: risk("Corrosion Risk", input.H2S / 50000 + input.CO2 / 100),
    },
    overall_risk: {
      level: hydrateLevel,
      score,
      summary:
        hydrateLevel === "HIGH"
          ? "Pipeline is operating outside the safe flow-assurance envelope. Immediate mitigation is required."
          : hydrateLevel === "MEDIUM"
            ? "Operating envelope shows degraded margins. Active monitoring is recommended."
            : "All risk indicators are within nominal operating limits.",
    },
    transient: {
      time: data.transient.time,
      temperature_profile: temperatureProfile,
      initial_temperature: input.T_inlet,
      minimum_temperature: minimumTemperature,
    },
    physics: {
      max_subcooling: data.physics.max_subcooling,
      hydrate_equilibrium_temperature: data.transient.hydrate_equilibrium,
      hydrate_risk_flag: data.physics.hydrate_flag,
    },
    insights: data.insights ?? [],
    observations: data.observations ?? [],
    recommendations: data.recommendations ?? [],
    operational_status: operationalStatus(hydrateLevel, score),
  };
}

export async function predict(input: PredictionInput): Promise<PredictionResult> {
  try {
    const { data } = await predictionsApi.post<BackendPredictResult>(
      "/predict",
      toBackendInput(input),
    );
    return fromBackendResult(input, data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        typeof error.response?.data === "object" &&
        error.response?.data !== null &&
        ("message" in error.response.data || "error" in error.response.data)
          ? String(error.response.data.message ?? error.response.data.error)
          : error.message;

      if (!error.response) {
        return mockPredict(input);
      }

      throw new Error(`Prediction request failed: ${message}`);
    }

    throw error;
  }
}

export async function analyzeShutdown(input: PredictionInput): Promise<ShutdownAnalysisResult> {
  const { data } = await predictionsApi.post<ShutdownAnalysisResult>(
    "/shutdown-analysis",
    toBackendInput(input),
  );
  return data;
}

export async function generateReport(input: PredictionInput): Promise<Blob> {
  const { data } = await predictionsApi.post<Blob>("/report", toBackendInput(input), {
    responseType: "blob",
  });
  return data;
}
