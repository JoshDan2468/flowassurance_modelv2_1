import { Activity } from "lucide-react";

/*
 * Authentication routes.
 *
 * These paths are only for pages where a user logs in, creates an account,
 * or recovers their password.
 */
export const authRoutes = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
} as const;

// These links are used on the public home page.
export const authNavigation = [
  { title: "Login", url: authRoutes.login, icon: Activity },
  { title: "Create Account", url: authRoutes.register },
] as const;
