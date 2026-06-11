import type {
  OpsStatus,
  PredictionInput,
  PredictionResult,
  RiskItem,
  RiskLevel,
} from "@/features/simulations/types/prediction";

const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));

function levelFor(p: number): RiskLevel {
  if (p < 0.34) return "LOW";
  if (p < 0.67) return "MEDIUM";
  return "HIGH";
}

function risk(label: string, probability: number): RiskItem {
  const p = clamp(probability);
  return { label, probability: p, level: levelFor(p) };
}

export function mockPredict(input: PredictionInput): PredictionResult {
  // Simple physics-ish heuristics — purely illustrative.
  const dT = Math.max(0, input.T_inlet - input.T_seawater);
  const cooling = clamp((40 - dT) / 60 + input.shutdown_time / 24, 0, 1);
  const hydrateP = clamp(
    cooling * 0.7 + (1 - input.insulation / 100) * 0.3 - input.chemical_injection / 200,
    0.02,
    0.99,
  );
  const waxP = clamp(input.wax_content / 30 + (1 - input.insulation / 100) * 0.25, 0.02, 0.99);
  const asphP = clamp(input.asphaltene_index / 10 + (input.P_inlet / 600) * 0.2, 0.02, 0.99);
  const slugP = clamp(
    (input.Q_gas / (input.Q_oil + input.Q_water + 1)) * 0.08 + (input.D_pipe < 8 ? 0.2 : 0.1),
    0.02,
    0.99,
  );
  const corrP = clamp(
    (input.H2S / 5000) * 0.5 + (input.CO2 / 10) * 0.4 + input.age_days / 12000,
    0.02,
    0.99,
  );

  const risks = {
    hydrate: risk("Hydrate Formation Risk", hydrateP),
    wax: risk("Wax Deposition Risk", waxP),
    asphaltene: risk("Asphaltene Deposition Risk", asphP),
    slug: risk("Slugging Risk", slugP),
    corrosion: risk("Corrosion Risk", corrP),
  };

  const overallScore = clamp(
    Math.max(hydrateP, waxP, asphP, slugP, corrP) * 0.7 +
      ((hydrateP + waxP + asphP + slugP + corrP) / 5) * 0.3,
  );
  const overallLevel = levelFor(overallScore);

  // Transient thermal profile (exponential decay toward seawater temperature)
  const N = 49;
  const tau = 6 + input.insulation / 12; // hours
  const time: number[] = [];
  const temperature_profile: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1)) * Math.max(12, input.shutdown_time);
    time.push(+t.toFixed(2));
    const temp = input.T_seawater + (input.T_inlet - input.T_seawater) * Math.exp(-t / tau);
    temperature_profile.push(+temp.toFixed(2));
  }
  const minimum_temperature = temperature_profile[temperature_profile.length - 1];
  const hydrate_equilibrium_temperature = 18 + (input.P_inlet / 100) * 0.6;
  const max_subcooling = Math.max(0, hydrate_equilibrium_temperature - minimum_temperature);

  const opsStatus: OpsStatus =
    overallLevel === "HIGH"
      ? overallScore > 0.85
        ? "CRITICAL"
        : "WARNING"
      : overallLevel === "MEDIUM"
        ? "MONITOR"
        : "SAFE";

  const insights: string[] = [];
  if (hydrateP > 0.6)
    insights.push("Severe hydrate formation risk due to high subcooling during shutdown.");
  if (waxP > 0.5) insights.push("Elevated wax deposition risk — wall temperature approaches WAT.");
  if (corrP > 0.5)
    insights.push("Sour service conditions detected; corrosion rate trending upward.");
  if (slugP > 0.5) insights.push("Hydrodynamic slugging likely at current GOR and pipe ID.");
  if (asphP > 0.5) insights.push("Asphaltene onset pressure exceeded along the flowline.");
  if (insights.length === 0)
    insights.push("Operating envelope is within nominal flow assurance limits.");

  const observations = [
    `Max subcooling: ${max_subcooling.toFixed(2)} °C`,
    `Minimum temperature: ${minimum_temperature.toFixed(2)} °C`,
    `Hydrate equilibrium T: ${hydrate_equilibrium_temperature.toFixed(2)} °C`,
    `Inlet ΔT vs seawater: ${dT.toFixed(2)} °C`,
    `GOR proxy: ${(input.Q_gas / (input.Q_oil + 1)).toFixed(2)}`,
  ];

  const recommendations: string[] = [];
  if (hydrateP > 0.5) {
    recommendations.push("Increase MEG / methanol injection rate immediately.");
    recommendations.push("Reduce planned shutdown duration below no-touch time.");
  }
  if (input.insulation < 70)
    recommendations.push("Improve pipeline insulation or add active heating.");
  if (overallLevel === "HIGH")
    recommendations.push("Initiate controlled restart procedure with operator on standby.");
  if (waxP > 0.5) recommendations.push("Schedule pigging operation within 72 hours.");
  if (corrP > 0.5) recommendations.push("Increase corrosion inhibitor dosage and inspect coupons.");
  if (recommendations.length === 0)
    recommendations.push("Maintain current operating envelope; continue routine monitoring.");

  const summary =
    overallLevel === "HIGH"
      ? "Pipeline is operating outside safe flow-assurance envelope. Immediate mitigation required."
      : overallLevel === "MEDIUM"
        ? "Operating envelope shows degraded margins. Active monitoring recommended."
        : "All risk indicators are within nominal operating limits.";

  return {
    id: `SIM-${Date.now().toString(36).toUpperCase()}`,
    created_at: new Date().toISOString(),
    input,
    risks,
    overall_risk: { level: overallLevel, score: overallScore, summary },
    transient: {
      time,
      temperature_profile,
      initial_temperature: input.T_inlet,
      minimum_temperature,
    },
    physics: {
      max_subcooling,
      hydrate_equilibrium_temperature,
      hydrate_risk_flag: max_subcooling > 3,
    },
    insights,
    observations,
    recommendations,
    operational_status: opsStatus,
  };
}
