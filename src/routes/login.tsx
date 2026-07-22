import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, SubmitButton } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

import { notify } from "@/lib/notify";
import { notifyAuthError, mapSupabaseAuthError } from "@/lib/auth-errors";
import { logAuthEvent } from "@/lib/auth-audit";
import { sanitizeNextPath } from "@/lib/sanitize-next-path";
import { APP_NAME } from "@/constants/app";

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

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your {APP_NAME} workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={onGoogleSignIn} type="button">
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR{" "}
            <div className="h-px flex-1 bg-border" />
          </div>
          <Form form={form} onSubmit={onSubmit}>
            <FormField<Values>
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
            />
            <FormField<Values>
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
            />
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
              <SubmitButton>Sign in</SubmitButton>
            </div>
          </Form>

          <div className="rounded-md border border-dashed bg-muted/40 p-3 text-xs">
            <p className="mb-2 font-medium text-foreground">Demo accounts</p>
            <ul className="space-y-1.5">
              {DEMO_USERS.map((u) => (
                <li key={u.email} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    <span className="font-mono">{u.email}</span>
                    <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                      {u.role}
                    </span>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      form.setValue("email", u.email);
                      form.setValue("password", DEMO_PASSWORD);
                    }}
                  >
                    Use
                  </Button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-muted-foreground">
              Password: <span className="font-mono">{DEMO_PASSWORD}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

const DEMO_PASSWORD = "DemoPass123!";
const DEMO_USERS = [
  { email: "admin@demo.test", role: "admin" },
  { email: "member@demo.test", role: "member" },
] as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-primary" />
            <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
