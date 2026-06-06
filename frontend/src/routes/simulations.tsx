import { createFileRoute } from "@tanstack/react-router";
import { SimulationsPage } from "@/pages/Simulations/SimulationsPage";

export const Route = createFileRoute("/simulations")({
  head: () => ({
    meta: [
      { title: "Saved Simulations - FAIP" },
      {
        name: "description",
        content: "Browse historical flow assurance simulation results for this session.",
      },
    ],
  }),
  component: SimulationsPage,
});
