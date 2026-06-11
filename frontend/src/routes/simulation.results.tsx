import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  PlusSquare,
  Snowflake,
  Thermometer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskCard } from "@/features/simulations/components/risk-card";
import { RiskRadar } from "@/features/simulations/components/risk-radar";
import { ThermalChart } from "@/features/simulations/components/thermal-chart";
import { opsStatusMeta, riskBgClass, riskTextClass } from "@/features/simulations/lib/risk";
import { useSimulationStore } from "@/features/simulations/stores/simulation-store";

export const Route = createFileRoute("/simulation/results")({
  head: () => ({
    meta: [
      { title: "Simulation Results — FAIP" },
      {
        name: "description",
        content:
          "Predictive flow assurance risk dashboard, thermal profile and engineering recommendations.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const result = useSimulationStore((s) => s.current);

  if (!result) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-xl border border-dashed border-border/60 bg-card/60 p-10 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Waves className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">No simulation result loaded</h2>
        <p className="text-sm text-muted-foreground">
          Run a new prediction to populate the results dashboard.
        </p>
        <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Link to="/simulation/new">
            <PlusSquare className="mr-2 h-4 w-4" />
            New Simulation
          </Link>
        </Button>
      </div>
    );
  }

  const ops = opsStatusMeta(result.operational_status);
  const risksArr = Object.values(result.risks);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Prediction Result · <span className="font-mono">{result.id}</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Flow Assurance Risk Report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated {new Date(result.created_at).toLocaleString()} · Transient thermal + ML risk
            inference
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/simulation/new">
            <PlusSquare className="mr-2 h-4 w-4" />
            New Simulation
          </Link>
        </Button>
      </motion.div>

      {/* Section 1: Risk summary cards */}
      <div>
        <SectionHeading n="01" title="Risk Summary" subtitle="Per-mode failure probability." />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {risksArr.map((r, i) => (
            <RiskCard key={r.label} risk={r} index={i} />
          ))}
        </div>
      </div>

      {/* Section 2 + 10: Overall risk + Operational decision */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          className={`relative overflow-hidden border lg:col-span-2 ${riskBgClass(result.overall_risk.level)}`}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-foreground/5 blur-3xl" />
          <CardHeader className="pb-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Overall Risk Assessment
            </div>
            <CardTitle className="text-xl">Aggregate Flow Assurance Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div
                  className={`font-mono text-6xl font-bold ${riskTextClass(result.overall_risk.level)}`}
                >
                  {result.overall_risk.level}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Composite score:{" "}
                  <span className="font-mono text-foreground">
                    {(result.overall_risk.score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                {result.overall_risk.summary}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Engineering Decision
            </div>
            <CardTitle className="text-base">Operational Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border-2 font-mono text-xs font-bold uppercase tracking-wider"
                style={{
                  color: ops.color,
                  borderColor: ops.color,
                  backgroundColor: `color-mix(in oklab, ${ops.color} 12%, transparent)`,
                }}
              >
                {ops.label}
              </div>
              <p className="flex-1 text-sm text-muted-foreground">{ops.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Transient thermal */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/80 lg:col-span-2">
          <CardHeader className="pb-2">
            <SectionHeading
              n="03"
              title="Transient Thermal Analysis"
              subtitle="Pipeline temperature evolution during shutdown."
              inline
            />
          </CardHeader>
          <CardContent>
            <ThermalChart
              series={result.transient}
              hydrateEqT={result.physics.hydrate_equilibrium_temperature}
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <KpiPill
                label="Initial Temperature"
                value={`${result.transient.initial_temperature.toFixed(2)} °C`}
                icon={Thermometer}
              />
              <KpiPill
                label="Minimum Temperature"
                value={`${result.transient.minimum_temperature.toFixed(2)} °C`}
                icon={Snowflake}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 9: Radar */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <SectionHeading
              n="09"
              title="Risk Visualization"
              subtitle="Multi-mode comparison."
              inline
            />
          </CardHeader>
          <CardContent>
            <RiskRadar risks={result.risks} />
          </CardContent>
        </Card>
      </div>

      {/* Section 4 + 5: Hydrate & Physics */}
      <div>
        <SectionHeading
          n="04 / 05"
          title="Hydrate & Physics Analysis"
          subtitle="Subcooling, equilibrium and physical interpretation."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Max Subcooling"
            value={`${result.physics.max_subcooling.toFixed(2)} °C`}
            hint="Drive force toward hydrate stability region"
          />
          <KpiCard
            label="Hydrate Eq. Temperature"
            value={`${result.physics.hydrate_equilibrium_temperature.toFixed(2)} °C`}
            hint="At current pressure & composition"
          />
          <KpiCard
            label="Hydrate Risk Flag"
            value={result.physics.hydrate_risk_flag ? "ACTIVE" : "CLEAR"}
            danger={result.physics.hydrate_risk_flag}
            hint={
              result.physics.hydrate_risk_flag
                ? "Operating inside hydrate envelope"
                : "Outside hydrate envelope"
            }
          />
          <KpiCard
            label="Engineering Interpretation"
            value={result.physics.hydrate_risk_flag ? "Mitigation Required" : "Nominal"}
            hint={
              result.physics.hydrate_risk_flag
                ? "Increase inhibitor or shorten no-touch time."
                : "Maintain current operating envelope."
            }
          />
        </div>
      </div>

      {/* Sections 6 / 7 / 8: Insights / Observations / Recommendations */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-[color:var(--risk-medium)]/40 bg-[color:var(--risk-medium)]/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[color:var(--risk-medium)]" />
              <SectionHeading n="06" title="Insights" inline />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.insights.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-[color:var(--risk-medium)]/30 bg-background/30 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--risk-medium)]" />
                <span className="text-foreground/90">{m}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <SectionHeading n="07" title="Observations" inline />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {result.observations.map((o, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 border-b border-border/40 pb-2 last:border-0"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="font-mono text-xs text-muted-foreground">{o}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <SectionHeading n="08" title="Recommendations" inline />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.recommendations.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-primary/20 bg-background/40 p-3 text-sm"
              >
                <Badge
                  variant="outline"
                  className="mt-0.5 border-primary/40 bg-primary/10 font-mono text-[10px] text-primary"
                >
                  {String(i + 1).padStart(2, "0")}
                </Badge>
                <span className="text-foreground/90">{r}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionHeading({
  n,
  title,
  subtitle,
  inline,
}: {
  n: string;
  title: string;
  subtitle?: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Section {n}
        </div>
        <div className="mt-0.5 text-base font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          Section {n}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>
      <div className="mt-1 text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
    </div>
  );
}

function KpiPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Thermometer;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  danger,
}: {
  label: string;
  value: string;
  hint?: string;
  danger?: boolean;
}) {
  return (
    <Card
      className={`border ${danger ? "border-[color:var(--risk-high)]/40 bg-[color:var(--risk-high)]/10" : "border-border/60 bg-card/80"}`}
    >
      <CardContent className="p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div
          className={`mt-2 font-mono text-xl font-semibold ${danger ? "text-[color:var(--risk-high)]" : "text-foreground"}`}
        >
          {value}
        </div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
