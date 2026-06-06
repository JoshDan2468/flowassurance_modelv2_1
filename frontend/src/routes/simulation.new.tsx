import { createFileRoute } from "@tanstack/react-router";
import { NewSimulationPage } from "@/pages/Simulations/NewSimulationPage";

export const Route = createFileRoute("/simulation/new")({
  head: () => ({
    meta: [
      { title: "New Simulation - FAIP" },
      {
        name: "description",
        content: "Configure pipeline operating conditions and run a flow assurance prediction.",
      },
    ],
  }),
  component: NewSimulationPage,
});
