import { Link, useRouterState } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboardNavigation } from "@/routes/-routes";

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => currentPath.startsWith(p);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
              FAIP
            </div>
            <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Flow Assurance Intel
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em]">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground group-data-[collapsible=icon]:hidden">
          v1.0 · Subsea Edition
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
