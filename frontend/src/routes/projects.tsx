import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects - FAIP" },
      { name: "description", content: "Subsea pipeline project registry." },
    ],
  }),
  component: () => <Navigate to="/assets" />,
});
