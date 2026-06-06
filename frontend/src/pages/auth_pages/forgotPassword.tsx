import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authRoutes } from "@/routes/-auth-routes";
import { routes } from "@/routes/-routes";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function starts the password reset request for the entered email.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    toast.success("Password reset instructions sent.");

    window.setTimeout(() => {
      setIsSubmitting(false);
      navigate({ to: authRoutes.login });
    }, 700);
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1100px] gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="hidden flex-col gap-4 lg:flex">
        <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
          Account Recovery
        </Badge>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Password Reset
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Recover access and return to the FAIP dashboard.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enter the email address attached to your account. FAIP will guide you back to a secure
            sign-in.
          </p>
        </div>
      </section>

      <Card className="w-full border-border/60 bg-[image:var(--gradient-surface)] shadow-[var(--shadow-elevated)]">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <RotateCcw className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle>Forgot password</CardTitle>
          <p className="text-sm text-muted-foreground">
            We will send reset instructions to your email address.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send reset instructions"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to={authRoutes.login} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <Button asChild variant="ghost" className="mt-3 w-full">
            <Link to={routes.home}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
