import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, SubmitButton } from "@/components/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";
import { notifyAuthError, mapSupabaseAuthError } from "@/lib/auth-errors";
import { logAuthEvent } from "@/lib/auth-audit";
import { APP_NAME } from "@/constants/app";
import { AuthShell } from "@/routes/login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `Reset password — ${APP_NAME}` },
      { name: "description", content: "Set a new password for your account." },
      { property: "og:title", content: `Reset password — ${APP_NAME}` },
      { property: "og:description", content: "Set a new password for your account." },
    ],
  }),
  component: ResetPage,
});

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type Values = z.infer<typeof schema>;

function ResetPage() {
  const navigate = useNavigate();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: Values) {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      notifyAuthError(mapSupabaseAuthError(error));
      return;
    }
    logAuthEvent("password_reset_completed");
    notify.success("Password updated");
    navigate({ to: "/login" });
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <FormField<Values>
              name="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              required
            />
            <FormField<Values>
              name="confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
            />
            <div className="flex justify-end">
              <SubmitButton>Update password</SubmitButton>
            </div>
          </Form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
