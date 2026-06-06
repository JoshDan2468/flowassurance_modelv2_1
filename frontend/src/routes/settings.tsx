import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/Settings/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings - FAIP" },
      { name: "description", content: "Application settings and backend configuration." },
    ],
  }),
  component: SettingsPage,
});
