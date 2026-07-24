import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Form, FormField, SubmitButton } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

import { notify } from "@/lib/notify";
import { notifyAuthError, mapSupabaseAuthError } from "@/lib/auth-errors";
import { logAuthEvent } from "@/lib/auth-audit";
import { sanitizeNextPath } from "@/lib/sanitize-next-path";
import { APP_NAME, APP_VERSION } from "@/constants/app";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: `Sign in — ${APP_NAME}` },
      { name: "description", content: `Sign in to ${APP_NAME}.` },
      { property: "og:title", content: `Sign in — ${APP_NAME}` },
      { property: "og:description", content: `Sign in to ${APP_NAME}.` },
    ],
  }),
  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: sanitizeNextPath(search.redirect) });
  },
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const nextPath = sanitizeNextPath(search.redirect);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: Values) {
    const { data, error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      const code = mapSupabaseAuthError(error);
      notifyAuthError(code);
      return;
    }
    notify.success("Signed in");
    logAuthEvent("user_logged_in", { entityId: data.user?.id });
    void navigate({ to: nextPath, replace: true });
  }

  async function onGoogleSignIn() {
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) notifyAuthError(mapSupabaseAuthError(error));
    } catch (err) {
      notifyAuthError(mapSupabaseAuthError(err));
    }
  }

  function fillDevCredentials(email: string) {
    form.setValue("email", email);
    form.setValue("password", DEMO_PASSWORD);
    void form.handleSubmit(onSubmit)();
  }

  const isSubmitting = form.formState.isSubmitting;
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <AuthShell>
      <Card className="animate-in fade-in border-brand-border rounded-2xl shadow-xl duration-300">
        <CardContent className="space-y-6 px-6 py-8 sm:px-8">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div
                className="bg-brand-red grid h-10 w-10 place-items-center rounded-lg font-black text-white shadow-sm"
                aria-hidden="true"
              >
                B
              </div>
              <div className="text-left">
                <div className="text-brand-text text-lg leading-tight font-bold tracking-tight">
                  {APP_NAME}
                </div>
                <div className="text-brand-red text-[10px] font-semibold tracking-widest uppercase">
                  Enterprise Operating System
                </div>
              </div>
            </div>
            <p className="text-brand-text-muted mx-auto max-w-sm text-xs">
              Manage Companies, Teams, Finance, HR, CRM, Projects, and Operations from one platform.
            </p>
            <div className="space-y-1 pt-2">
              <h1 className="text-brand-text text-2xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-brand-text-muted text-sm">
                Sign in to access your Business Operating System.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="border-brand-border w-full"
            onClick={onGoogleSignIn}
            type="button"
          >
            Continue with Google
          </Button>

          <div className="text-brand-text-muted flex items-center gap-3 text-xs">
            <div className="bg-brand-border h-px flex-1" />
            OR
            <div className="bg-brand-border h-px flex-1" />
          </div>

          <Form form={form} onSubmit={onSubmit}>
            <FormField<Values>
              name="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              required
            />

            <div className="space-y-1.5">
              <Label htmlFor="password">
                Password <span className="text-brand-error">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  aria-invalid={!!passwordError}
                  className="pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="text-brand-text-muted hover:text-brand-text focus-visible:ring-ring absolute inset-y-0 right-0 flex items-center px-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p className="text-brand-error text-xs">{passwordError}</p>
              ) : null}
              {emailError ? null : null}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v === true)}
                />
                <Label
                  htmlFor="remember-me"
                  className="text-brand-text-muted cursor-pointer text-sm font-normal"
                >
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-brand-red hover:text-brand-red-hover text-sm font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <SubmitButton
              className="bg-brand-red hover:bg-brand-red-hover mt-2 h-12 w-full rounded-lg text-base font-semibold text-white shadow-sm transition-colors disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Login"
              )}
            </SubmitButton>
          </Form>

          {import.meta.env.DEV ? (
            <div className="space-y-3 pt-2">
              <div className="text-brand-text-muted flex items-center gap-3 text-xs">
                <div className="bg-brand-border h-px flex-1" />
                Development Login
                <div className="bg-brand-border h-px flex-1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEV_ROLES.map((role) => (
                  <Button
                    key={role.label}
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => fillDevCredentials(role.email)}
                    className="border-brand-red text-brand-red hover:bg-brand-red hover:border-brand-red h-10 text-xs font-medium hover:text-white"
                  >
                    {role.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-brand-border space-y-2 border-t pt-4 text-center text-sm">
            <div>
              <Link
                to="/"
                className="text-brand-text-muted hover:text-brand-red font-medium transition-colors"
              >
                Go to Home
              </Link>
            </div>
            <div className="text-brand-text-muted">
              Don&apos;t have an account?{" "}
              <Link
                to="/auth"
                className="text-brand-red hover:text-brand-red-hover font-semibold transition-colors"
              >
                Create Account
              </Link>
            </div>
            <div className="text-brand-text-muted flex items-center justify-center gap-3 text-xs">
              <span
                aria-disabled="true"
                className="cursor-not-allowed opacity-60"
                role="link"
              >
                Privacy Policy
              </span>
              <span aria-hidden="true">·</span>
              <span
                aria-disabled="true"
                className="cursor-not-allowed opacity-60"
                role="link"
              >
                Terms of Service
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

const DEMO_PASSWORD = "DemoPass123!";
const DEV_ROLES = [
  { label: "Platform Admin", email: "admin@demo.test" },
  { label: "Tenant Admin", email: "admin@demo.test" },
  { label: "Company Admin", email: "member@demo.test" },
  { label: "Employee", email: "member@demo.test" },
] as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-surface relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-dotted-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="brand-corner-accent top-8 left-8 rounded-tl-2xl border-r-0 border-b-0"
        aria-hidden="true"
      />
      <div
        className="brand-corner-accent right-8 bottom-8 rounded-br-2xl border-t-0 border-l-0"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[480px] space-y-4">
        {children}
        <p className="text-brand-text-muted text-center text-xs">
          © 2026 {APP_NAME} · v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
