import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, LockKeyhole, Mail, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authRoutes } from "@/routes/-auth-routes";

const emptyForm = {
  fullName: "",
  company: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This keeps every input connected to the matching field in formData.
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  // This checks the form before sending the user to the login page.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    toast.success("Account created. Please sign in.");

    window.setTimeout(() => {
      setIsSubmitting(false);
      navigate({ to: authRoutes.login });
    }, 700);
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1100px] gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="hidden flex-col gap-4 lg:flex">
        <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
          New Operator
        </Badge>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Account Setup
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Create your FAIP account for dashboard access.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Register once, then sign in to run simulations and view operational reports from the
            same dashboard workflow.
          </p>
        </div>
      </section>

      <Card className="w-full border-border/60 bg-[image:var(--gradient-surface)] shadow-[var(--shadow-elevated)]">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <UserPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle>Create account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in your details to prepare a new FAIP login.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="register-full-name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-full-name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-company">Company or team</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-confirm-password">Confirm password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <UserPlus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to={authRoutes.login} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;
