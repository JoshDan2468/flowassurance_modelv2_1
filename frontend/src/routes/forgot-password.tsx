import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";

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
