import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - FAIP" },
      {
        name: "description",
        content: "Operations overview: live flow assurance risk posture across subsea assets.",
      },
    ],
  }),
  component: DashboardPage,
});
