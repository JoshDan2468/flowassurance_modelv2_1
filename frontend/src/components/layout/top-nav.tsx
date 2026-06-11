import { Bell, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl sm:px-5">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden h-6 w-px bg-border md:block" />
      <div className="hidden flex-col leading-tight md:flex">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Project
        </span>
        <span className="text-sm font-medium text-foreground">North Sea · Field Bravo-7</span>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Badge
          variant="outline"
          className="hidden border-[color:var(--risk-low)]/40 bg-[color:var(--risk-low)]/10 text-[color:var(--risk-low)] sm:inline-flex"
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--risk-low)]" />
          Live Telemetry
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--risk-high)]" />
        </Button>
        <button className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-2 py-1.5 text-left transition hover:bg-card">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-[image:var(--gradient-primary)] text-[11px] font-semibold text-primary-foreground">
              EK
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-medium text-foreground">Eng. Khaled</span>
            <span className="text-[10px] text-muted-foreground">Flow Assurance Lead</span>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </button>
      </div>
    </header>
  );
}
