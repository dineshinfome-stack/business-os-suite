import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, SubmitButton } from "@/components/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";
import { APP_NAME } from "@/constants/app";
import { AuthShell } from "@/routes/login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: `Forgot password — ${APP_NAME}` },
      { name: "description", content: "Request a password reset link." },
      { property: "og:title", content: `Forgot password — ${APP_NAME}` },
      { property: "og:description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPage,
});

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

function ForgotPage() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: Values) {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      notify.error("Could not send reset email", error.message);
      return;
    }
    notify.success("Check your email", "We've sent a password reset link.");
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <FormField<Values>
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
            />
            <div className="flex items-center justify-between">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Back to sign in
              </Link>
              <SubmitButton>Send reset link</SubmitButton>
            </div>
          </Form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
