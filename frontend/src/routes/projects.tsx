import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/pages/Projects/ProjectsPage";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects - FAIP" },
      { name: "description", content: "Subsea pipeline project registry." },
    ],
  }),
  component: ProjectsPage,
});
