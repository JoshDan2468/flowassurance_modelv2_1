import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { riskTextClass } from "@/features/simulations/lib/risk";
import { useSimulationStore } from "@/features/simulations/stores/simulation-store";

export const Route = createFileRoute("/simulations")({
  head: () => ({
    meta: [
      { title: "Saved Simulations — FAIP" },
      {
        name: "description",
        content: "Browse historical flow assurance simulation results for this session.",
      },
    ],
  }),
  component: SavedSimulations,
});

function SavedSimulations() {
  const history = useSimulationStore((s) => s.history);
  const setResult = useSimulationStore((s) => s.setResult);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Library
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Saved Simulations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historical predictions from the current session.
          </p>
        </div>
        <Button asChild className="bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Link to="/simulation/new">
            <PlusSquare className="mr-2 h-4 w-4" />
            New Simulation
          </Link>
        </Button>
      </div>

      {history.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/40">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-base font-medium">No saved simulations</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              When you run a simulation, it will appear here so you can return to the results.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {history.map((h) => (
            <Card
              key={h.id}
              className="border-border/60 bg-card/80 transition hover:border-primary/40"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-sm">{h.id}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`border ${riskTextClass(h.overall_risk.level)}`}
                  >
                    {h.overall_risk.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-1 text-xs">
                  {Object.values(h.risks).map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center justify-between border-b border-border/40 py-1"
                    >
                      <dt className="text-muted-foreground">{r.label.split(" ")[0]}</dt>
                      <dd className={`font-mono ${riskTextClass(r.level)}`}>
                        {(r.probability * 100).toFixed(0)}%
                      </dd>
                    </div>
                  ))}
                </dl>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setResult(h)}
                >
                  <Link to="/simulation/results">Open Result</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
