import { Navigate, createFileRoute } from "@tanstack/react-router";

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
  component: () => <Navigate to="/" />,
});
