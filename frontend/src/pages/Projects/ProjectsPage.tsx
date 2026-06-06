import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, Boxes, Waves } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Assets — FAIP" }, { name: "description", content: "Subsea pipeline project registry." }] }),
  component: AssetsPage,
});

const mockAssets = [
  { id: "BRV-7-FL01", field: "Bravo-7", length_km: 24.6, age_years: 5, status: "Operational", risk: "LOW" as const },
  { id: "BRV-7-FL02", field: "Bravo-7", length_km: 18.2, age_years: 8, status: "Operational", risk: "MEDIUM" as const },
  { id: "DLT-3-FL01", field: "Delta-3", length_km: 32.1, age_years: 12, status: "Mitigation Active", risk: "HIGH" as const },
  { id: "OMG-1-FL07", field: "Omega-1", length_km: 9.8, age_years: 2, status: "Operational", risk: "LOW" as const },
];

function AssetsPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Registry</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pipeline inventory under FAIP monitoring.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockAssets.map((a) => (
          <Card key={a.id} className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm">{a.id}</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    a.risk === "HIGH"
                      ? "border-[color:var(--risk-high)]/50 text-[color:var(--risk-high)]"
                      : a.risk === "MEDIUM"
                      ? "border-[color:var(--risk-medium)]/50 text-[color:var(--risk-medium)]"
                      : "border-[color:var(--risk-low)]/50 text-[color:var(--risk-low)]"
                  }
                >
                  {a.risk}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Waves className="h-3.5 w-3.5" /> {a.field}
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <Stat icon={<Boxes className="h-3.5 w-3.5" />} label="Length" value={`${a.length_km.toFixed(1)} km`} />
                <Stat icon={<Activity className="h-3.5 w-3.5" />} label="Age" value={`${a.age_years} y`} />
              </dl>
              <div className="mt-3 text-xs text-muted-foreground">{a.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { AssetsPage as ProjectsPage };

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-background/40 p-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  );
}
