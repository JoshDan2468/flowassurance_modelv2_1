import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/pages/auth_pages/register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register - FAIP" },
      {
        name: "description",
        content: "Create a Flow Assurance Intelligence Platform account.",
      },
    ],
  }),
  component: RegisterPage,
});
