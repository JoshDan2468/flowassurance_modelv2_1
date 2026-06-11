import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";

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
