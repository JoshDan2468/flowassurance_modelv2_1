import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TransientSeries } from "@/features/simulations/types/prediction";

export function ThermalChart({
  series,
  hydrateEqT,
}: {
  series: TransientSeries;
  hydrateEqT?: number;
}) {
  const data = series.time.map((t, i) => ({ t, temp: series.temperature_profile[i] }));
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="t"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Time (h)",
              position: "insideBottom",
              offset: -2,
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Temperature (°C)",
              angle: -90,
              position: "insideLeft",
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            formatter={(v: number) => [`${v.toFixed(2)} °C`, "Temperature"]}
            labelFormatter={(l: number) => `t = ${l} h`}
          />
          {hydrateEqT !== undefined && (
            <ReferenceLine
              y={hydrateEqT}
              stroke="var(--risk-high)"
              strokeDasharray="4 4"
              label={{
                value: `Hydrate Eq. T (${hydrateEqT.toFixed(1)}°C)`,
                position: "insideTopRight",
                fill: "var(--risk-high)",
                fontSize: 10,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="temp"
            stroke="var(--chart-1)"
            fill="url(#tempFill)"
            strokeWidth={2.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
