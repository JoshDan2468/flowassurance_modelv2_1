import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/auth_pages/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FAIP - Home" },
      {
        name: "description",
        content: "Start here to log in or create an account for FAIP.",
      },
    ],
  }),
  component: HomePage,
});
