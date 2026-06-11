import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldInput } from "@/features/simulations/components/field-input";
import { FormSection } from "@/features/simulations/components/section";
import { usePredict } from "@/features/simulations/hooks/use-predict";
import type { PredictionInput } from "@/features/simulations/types/prediction";

export const Route = createFileRoute("/simulation/new")({
  head: () => ({
    meta: [
      { title: "New Simulation — FAIP" },
      {
        name: "description",
        content: "Configure pipeline operating conditions and run a flow assurance prediction.",
      },
    ],
  }),
  component: NewSimulationPage,
});

const num = (min?: number, max?: number) => {
  let s = z.number({ invalid_type_error: "Required" }).finite("Required");
  if (min !== undefined) s = s.min(min, `Must be ≥ ${min}`);
  if (max !== undefined) s = s.max(max, `Must be ≤ ${max}`);
  return s;
};

const schema = z.object({
  T_inlet: num(-50, 250),
  P_inlet: num(0, 1500),
  Q_gas: num(0),
  Q_oil: num(0),
  Q_water: num(0),
  D_pipe: num(0.1, 60),
  T_seawater: num(-5, 40),
  salinity: num(0, 100),
  gas_gravity: num(0.5, 1.5),
  oil_API: num(5, 70),
  H2S: num(0, 50000),
  CO2: num(0, 50),
  wax_content: num(0, 60),
  asphaltene_index: num(0, 10),
  insulation: num(0, 100),
  chemical_injection: num(0, 1000),
  age_days: num(0, 30000),
  shutdown_time: num(0, 240),
}) satisfies z.ZodType<PredictionInput>;

const defaults: PredictionInput = {
  T_inlet: 65,
  P_inlet: 180,
  Q_gas: 12,
  Q_oil: 8500,
  Q_water: 1200,
  D_pipe: 12,
  T_seawater: 4,
  salinity: 35,
  gas_gravity: 0.72,
  oil_API: 32,
  H2S: 120,
  CO2: 2.8,
  wax_content: 6.5,
  asphaltene_index: 1.8,
  insulation: 65,
  chemical_injection: 40,
  age_days: 1825,
  shutdown_time: 6,
};

function NewSimulationPage() {
  const navigate = useNavigate();
  const predict = usePredict();
  const methods = useForm<PredictionInput>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await predict.mutateAsync(values);
      toast.success("Prediction completed", { description: "Opening results dashboard." });
      navigate({ to: "/simulation/results" });
    } catch (e) {
      toast.error("Prediction failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Prediction Engine
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              New Simulation
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Define operating conditions, environment, fluid properties and mitigation strategy.
              The FAIP engine runs transient thermal simulation, feature engineering and ML-based
              risk assessment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                methods.reset(defaults);
                toast.info("Form reset");
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={predict.isPending}
              className="bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
            >
              {predict.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {predict.isPending ? "Running…" : "Run Simulation"}
            </Button>
          </div>
        </motion.div>

        <FormSection
          index="A"
          title="Operating Conditions"
          description="Pipeline inlet conditions and produced fluid flow rates."
        >
          <FieldInput<PredictionInput> name="T_inlet" label="Inlet Temperature" unit="°C" />
          <FieldInput<PredictionInput> name="P_inlet" label="Inlet Pressure" unit="bar" />
          <FieldInput<PredictionInput> name="Q_gas" label="Gas Flow Rate" unit="MMscfd" />
          <FieldInput<PredictionInput> name="Q_oil" label="Oil Flow Rate" unit="bbl/d" />
          <FieldInput<PredictionInput> name="Q_water" label="Water Flow Rate" unit="bbl/d" />
          <FieldInput<PredictionInput> name="D_pipe" label="Pipe Diameter" unit="in" />
        </FormSection>

        <FormSection
          index="B"
          title="Environmental Conditions"
          description="Subsea environmental envelope around the pipeline."
        >
          <FieldInput<PredictionInput> name="T_seawater" label="Seawater Temperature" unit="°C" />
          <FieldInput<PredictionInput> name="salinity" label="Salinity" unit="ppt" />
        </FormSection>

        <FormSection
          index="C"
          title="Fluid Properties"
          description="Compositional and PVT characteristics of the production stream."
        >
          <FieldInput<PredictionInput> name="gas_gravity" label="Gas Gravity" unit="SG" />
          <FieldInput<PredictionInput> name="oil_API" label="Oil API Gravity" unit="°API" />
          <FieldInput<PredictionInput> name="H2S" label="H₂S Content" unit="ppm" />
          <FieldInput<PredictionInput> name="CO2" label="CO₂ Content" unit="mol%" />
          <FieldInput<PredictionInput> name="wax_content" label="Wax Content" unit="wt%" />
          <FieldInput<PredictionInput>
            name="asphaltene_index"
            label="Asphaltene Index"
            unit="idx"
          />
        </FormSection>

        <FormSection
          index="D"
          title="Asset & Mitigation"
          description="Pipeline asset metadata and active mitigation strategy."
        >
          <FieldInput<PredictionInput> name="insulation" label="Insulation Efficiency" unit="%" />
          <FieldInput<PredictionInput>
            name="chemical_injection"
            label="Chemical Injection Rate"
            unit="L/h"
          />
          <FieldInput<PredictionInput> name="age_days" label="Pipeline Age" unit="days" />
          <FieldInput<PredictionInput> name="shutdown_time" label="Shutdown Duration" unit="h" />
        </FormSection>

        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-xl border border-border/60 bg-card/80 p-3 backdrop-blur-xl">
          <span className="mr-auto text-xs text-muted-foreground">
            {predict.isPending
              ? "Running transient thermal simulation + ML inference…"
              : "Ready to run prediction."}
          </span>
          <Button type="button" variant="ghost" onClick={() => methods.reset(defaults)}>
            Reset
          </Button>
          <Button
            type="submit"
            disabled={predict.isPending}
            className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95"
          >
            {predict.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Simulation
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
