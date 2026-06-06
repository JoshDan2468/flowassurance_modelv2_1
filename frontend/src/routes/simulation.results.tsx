import { createFileRoute } from "@tanstack/react-router";
import { SimulationResultsPage } from "@/pages/Simulations/SimulationResultsPage";

export const Route = createFileRoute("/simulation/results")({
  head: () => ({
    meta: [
      { title: "Simulation Results - FAIP" },
      {
        name: "description",
        content: "Predictive flow assurance risk dashboard, thermal profile and engineering recommendations.",
      },
    ],
  }),
  component: SimulationResultsPage,
});
