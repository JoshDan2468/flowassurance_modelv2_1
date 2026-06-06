import type { OpsStatus, RiskLevel } from "@/types/prediction";

export function riskColorVar(level: RiskLevel): string {
  if (level === "LOW") return "var(--risk-low)";
  if (level === "MEDIUM") return "var(--risk-medium)";
  return "var(--risk-high)";
}

export function riskTextClass(level: RiskLevel): string {
  if (level === "LOW") return "text-[color:var(--risk-low)]";
  if (level === "MEDIUM") return "text-[color:var(--risk-medium)]";
  return "text-[color:var(--risk-high)]";
}

export function riskBgClass(level: RiskLevel): string {
  if (level === "LOW") return "bg-[color:var(--risk-low)]/15 border-[color:var(--risk-low)]/40";
  if (level === "MEDIUM") return "bg-[color:var(--risk-medium)]/15 border-[color:var(--risk-medium)]/40";
  return "bg-[color:var(--risk-high)]/15 border-[color:var(--risk-high)]/40";
}

export function opsStatusMeta(status: OpsStatus): { label: string; color: string; description: string } {
  switch (status) {
    case "SAFE":
      return { label: "SAFE", color: "var(--risk-low)", description: "All systems within nominal envelope." };
    case "MONITOR":
      return { label: "MONITOR", color: "var(--risk-medium)", description: "Operating envelope showing degraded margins." };
    case "WARNING":
      return { label: "WARNING", color: "var(--risk-high)", description: "Mitigation required to remain inside safe envelope." };
    case "CRITICAL":
      return { label: "CRITICAL", color: "var(--risk-high)", description: "Immediate intervention required. Initiate shutdown protocol." };
  }
}