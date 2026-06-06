import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth_pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - FAIP" },
      { name: "description", content: "Sign in to the Flow Assurance Intelligence Platform." },
    ],
  }),
  component: LoginPage,
});
