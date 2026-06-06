import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/pages/Reports/ReportsPage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports - FAIP" },
      { name: "description", content: "Engineering reports and exports." },
    ],
  }),
  component: ReportsPage,
});
