import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Droplets,
  Flame,
  Gauge,
  PlusSquare,
  ShieldCheck,
  Thermometer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/routes/-routes";
import { useSimulationStore } from "@/store/simulation-store";
import { riskTextClass } from "@/lib/risk";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const kpis = [
  { label: "Assets Monitored", value: "24", icon: Waves, trend: "+2 this quarter" },
  { label: "Active Simulations", value: "7", icon: Activity, trend: "Last 24h" },
  { label: "Critical Alerts", value: "1", icon: Flame, trend: "Field Bravo-7" },
  { label: "Avg. Hydrate Margin", value: "8.4°C", icon: Thermometer, trend: "Within envelope" },
];

const sampleSeries = Array.from({ length: 24 }, (_, i) => ({
  t: `${i}:00`,
  hydrate: 0.2 + Math.sin(i / 3) * 0.15 + Math.random() * 0.05,
  wax: 0.15 + Math.cos(i / 4) * 0.1 + Math.random() * 0.05,
  corrosion: 0.25 + Math.sin(i / 5) * 0.08 + Math.random() * 0.04,
}));

function Dashboard() {
  const history = useSimulationStore((s) => s.history);
  const latest = useSimulationStore((s) => s.current);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Operations Center
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Flow Assurance Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Predictive intelligence across subsea pipelines — hydrates, wax, asphaltenes, slugging,
            corrosion and restart safety.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
        >
          <Link to={routes.newSimulation}>
            <PlusSquare className="mr-2 h-4 w-4" />
            Run New Simulation
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden border-border/60 bg-[image:var(--gradient-surface)]">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {k.label}
                  </span>
                  <k.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold text-foreground">
                  {k.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{k.trend}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/80 lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base">Risk Probability — Last 24 Hours</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Rolling probability across primary flow-assurance modes.
              </p>
            </div>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampleSeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="t"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hydrate"
                    stroke="var(--chart-1)"
                    fill="url(#g1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="wax"
                    stroke="var(--chart-4)"
                    fill="url(#g2)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="corrosion"
                    stroke="var(--chart-5)"
                    fill="url(#g3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Latest Simulation</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Most recent FAIP prediction result.
            </p>
          </CardHeader>
          <CardContent>
            {latest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{latest.id}</span>
                  <Badge
                    className={`border ${riskTextClass(latest.overall_risk.level)} bg-transparent`}
                  >
                    {latest.overall_risk.level}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {Object.values(latest.risks).map((r) => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-mono ${riskTextClass(r.level)}`}>
                        {(r.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to={routes.simulationResults}>
                    View Full Report
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">No simulations yet</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Run a prediction to populate this panel.
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to={routes.newSimulation}>Run Simulation</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 bg-background/30 px-4 py-6 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" />
              No simulation history. Start by running a new prediction.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {history.slice(0, 6).map((h) => (
                <div key={h.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">{h.id}</div>
                      <div className="text-sm text-foreground">
                        {new Date(h.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`border ${riskTextClass(h.overall_risk.level)}`}
                  >
                    {h.overall_risk.level}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { Dashboard as DashboardPage };
