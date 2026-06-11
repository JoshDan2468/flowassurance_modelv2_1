import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FormSection({
  index,
  title,
  description,
  children,
}: {
  index: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            Section {index}
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <CardTitle className="mt-1 text-lg font-semibold tracking-tight">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </CardContent>
    </Card>
  );
}
