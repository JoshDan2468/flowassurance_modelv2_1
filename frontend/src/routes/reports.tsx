import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — FAIP" },
      { name: "description", content: "Engineering reports and exports." },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Reports"
      icon={<FileBarChart2 className="h-6 w-6 text-primary" />}
      description="Curated engineering reports, PDF exports and stakeholder briefings will live here."
    />
  ),
});

function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Module</div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <Card className="mt-6 border-dashed border-border/60 bg-card/40">
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="rounded-full bg-primary/10 p-3">{icon}</div>
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
          <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
            Coming soon
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
