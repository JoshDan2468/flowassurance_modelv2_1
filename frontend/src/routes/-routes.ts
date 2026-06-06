import {
  Boxes,
  FileBarChart2,
  FolderOpen,
  LayoutDashboard,
  PlusSquare,
  Settings,
} from "lucide-react";
import { authRoutes } from "@/routes/-auth-routes";

/*
 * Main application routes.
 *
 * Keep normal dashboard/app paths here. Authentication paths live in
 * -auth-routes.ts so login/register/password-reset routes are easy to find.
 */
export const routes = {
  home: "/",
  dashboard: "/dashboard",
  simulations: "/simulations",
  newSimulation: "/simulation/new",
  simulationResults: "/simulation/results",
  reports: "/reports",
  projects: "/projects",
  settings: "/settings",
} as const;

// These pages render without the dashboard sidebar and top navigation.
export const publicRoutes = [
  routes.home,
  authRoutes.login,
  authRoutes.register,
  authRoutes.forgotPassword,
] as const;

// These pages render inside the dashboard layout.
export const dashboardRoutes = [
  routes.dashboard,
  routes.newSimulation,
  routes.simulations,
  routes.reports,
  routes.projects,
  routes.settings,
] as const;

// Sidebar links for the dashboard area.
export const dashboardNavigation = [
  { title: "Dashboard", url: routes.dashboard, icon: LayoutDashboard },
  { title: "New Simulation", url: routes.newSimulation, icon: PlusSquare },
  { title: "Saved Simulations", url: routes.simulations, icon: FolderOpen },
  { title: "Reports", url: routes.reports, icon: FileBarChart2 },
  { title: "Projects", url: routes.projects, icon: Boxes },
  { title: "Settings", url: routes.settings, icon: Settings },
] as const;
