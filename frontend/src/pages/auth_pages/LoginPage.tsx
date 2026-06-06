import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, LockKeyhole, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authRoutes } from "@/routes/-auth-routes";
import { routes } from "@/routes/-routes";
import { login } from "@/services/authApi";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function runs when the user presses the Sign in button.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      toast.success("Signed in successfully");
      navigate({ to: routes.dashboard });
    } catch {
      toast.error("Unable to sign in. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1100px] gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="hidden flex-col gap-4 lg:flex">
        <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
          Secure Access
        </Badge>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Operations Center
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Sign in to continue monitoring pipeline risk.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use your FAIP account to open the dashboard, run simulations, and review flow assurance
            reports.
          </p>
        </div>
      </section>

      <Card className="w-full border-border/60 bg-[image:var(--gradient-surface)] shadow-[var(--shadow-elevated)]">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle>Login to FAIP</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to access your dashboard.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  to={authRoutes.forgotPassword}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <LogIn className="mr-2 h-4 w-4" />
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            New to FAIP?{" "}
            <Link to={authRoutes.register} className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
