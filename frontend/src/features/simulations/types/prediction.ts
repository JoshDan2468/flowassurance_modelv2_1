export interface PredictionInput {
  T_inlet: number;
  P_inlet: number;
  Q_gas: number;
  Q_oil: number;
  Q_water: number;
  D_pipe: number;
  T_seawater: number;
  gas_gravity: number;
  oil_API: number;
  salinity: number;
  H2S: number;
  CO2: number;
  wax_content: number;
  asphaltene_index: number;
  insulation: number;
  chemical_injection: number;
  age_days: number;
  shutdown_time: number;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type OpsStatus = "SAFE" | "MONITOR" | "WARNING" | "CRITICAL";

export interface RiskItem {
  label: string;
  probability: number; // 0..1
  level: RiskLevel;
}

export interface TransientSeries {
  time: number[]; // hours
  temperature_profile: number[]; // °C
  initial_temperature: number;
  minimum_temperature: number;
}

export interface PhysicsResult {
  max_subcooling: number; // °C
  hydrate_equilibrium_temperature: number; // °C
  hydrate_risk_flag: boolean;
}

export interface PredictionResult {
  id: string;
  created_at: string;
  input: PredictionInput;
  risks: {
    hydrate: RiskItem;
    wax: RiskItem;
    asphaltene: RiskItem;
    slug: RiskItem;
    corrosion: RiskItem;
  };
  overall_risk: {
    level: RiskLevel;
    score: number; // 0..1
    summary: string;
  };
  transient: TransientSeries;
  physics: PhysicsResult;
  insights: string[];
  observations: string[];
  recommendations: string[];
  operational_status: OpsStatus;
}
