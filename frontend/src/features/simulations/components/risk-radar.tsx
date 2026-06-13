import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { PredictionResult } from "@/features/simulations/types/prediction";

export function RiskRadar({ risks }: { risks: PredictionResult["risks"] }) {
  const data = [
    { axis: "Hydrate", value: risks.hydrate.probability * 100 },
    { axis: "Wax", value: risks.wax.probability * 100 },
    { axis: "Asphaltene", value: risks.asphaltene.probability * 100 },
    { axis: "Slug", value: risks.slug.probability * 100 },
    { axis: "Corrosion", value: risks.corrosion.probability * 100 },
  ];
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            stroke="var(--border)"
          />
          <Radar
            name="Risk"
            dataKey="value"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
