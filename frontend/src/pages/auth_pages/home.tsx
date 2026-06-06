import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Gauge, LockKeyhole, ShieldCheck, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authRoutes } from "@/routes/-auth-routes";

const highlights = [
  {
    title: "Risk prediction",
    detail: "Track hydrate, wax, corrosion, slugging, and restart safety signals.",
    icon: Gauge,
  },
  {
    title: "Secure workspace",
    detail: "Give operators a clear route into a protected dashboard workflow.",
    icon: LockKeyhole,
  },
  {
    title: "Live operations view",
    detail: "Keep subsea flow assurance decisions visible and easy to act on.",
    icon: Waves,
  },
];

export function HomePage() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <section className="grid min-h-[calc(100vh-9rem)] gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-5"
        >
          <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
            Flow Assurance Intelligence Platform
          </Badge>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Welcome Center
            </div>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Start from one clear home page, then sign in to manage flow assurance operations.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              FAIP helps teams monitor subsea pipeline risk, run simulations, and review reports
              from a dashboard built for fast engineering decisions.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
            >
              <Link to={authRoutes.login}>
                <Activity className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={authRoutes.register}>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid gap-3"
        >
          <Card className="overflow-hidden border-border/60 bg-[image:var(--gradient-surface)] shadow-[var(--shadow-elevated)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Platform Status
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">
                    Ready for operations
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border border-border/60 bg-background/30 p-3">
                  <div className="font-mono text-xl font-semibold">24</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Assets
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/30 p-3">
                  <div className="font-mono text-xl font-semibold">7</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Runs
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/30 p-3">
                  <div className="font-mono text-xl font-semibold">1</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Alert
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {highlights.map((item) => (
            <Card key={item.title} className="border-border/60 bg-card/80">
              <CardContent className="flex gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-foreground">{item.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

export default HomePage;
