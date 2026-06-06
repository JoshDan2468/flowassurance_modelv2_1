import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/pages/auth_pages/forgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password - FAIP" },
      {
        name: "description",
        content: "Recover access to your FAIP account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});
