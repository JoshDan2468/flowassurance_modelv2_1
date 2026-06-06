import { api, API_BASE } from "@/services/api";
import type {
  OpsStatus,
  PredictionInput,
  PredictionResult,
  RiskItem,
  RiskLevel,
} from "@/types/prediction";
import { mockPredict } from "@/services/mock-prediction";

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

function levelFor(score: number): RiskLevel {
  if (score < 0.34) return "LOW";
  if (score < 0.67) return "MEDIUM";
  return "HIGH";
}

function risk(label: string, probability: number, level = levelFor(probability)): RiskItem {
  return { label, probability: Math.max(0, Math.min(1, probability)), level };
}

function operationalStatus(level: RiskLevel, score: number): OpsStatus {
  if (level === "HIGH") return score > 0.85 ? "CRITICAL" : "WARNING";
  if (level === "MEDIUM") return "MONITOR";
  return "SAFE";
}

function toBackendInput(input: PredictionInput): PredictionInput {
  return {
    ...input,
    D_pipe: input.D_pipe / 39.3701,
    insulation: input.insulation >= 50 ? 1 : 0,
  };
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
          ? "Pipeline is operating outside safe flow-assurance envelope. Immediate mitigation required."
          : hydrateLevel === "MEDIUM"
            ? "Operating envelope shows degraded margins. Active monitoring recommended."
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
  if (!API_BASE) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockPredict(input);
  }

  const { data } = await api.post<BackendPredictResult>("/predict", toBackendInput(input));
  return fromBackendResult(input, data);
}

export async function analyzeShutdown(input: PredictionInput): Promise<ShutdownAnalysisResult> {
  const { data } = await api.post<ShutdownAnalysisResult>("/shutdown-analysis", toBackendInput(input));
  return data;
}
