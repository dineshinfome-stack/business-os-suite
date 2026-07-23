import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { PageContainer } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { APP_NAME } from "@/constants/app";
import { acceptInvitation } from "@/lib/workspace/functions";

const search = z.object({ token: z.string().min(20).max(200).optional() });

export const Route = createFileRoute("/_authenticated/workspace/accept")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: `Accept invitation — ${APP_NAME}` },
      { name: "description", content: "Accept your workspace invitation." },
    ],
  }),
  component: AcceptPage,
});

function AcceptPage() {
  const { token } = useSearch({ from: "/_authenticated/workspace/accept" });
  const navigate = useNavigate();
  const accept = useServerFn(acceptInvitation);
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || status !== "idle") return;
    setStatus("working");
    accept({ data: { token } })
      .then(() => {
        setStatus("done");
        notify.success("Invitation accepted — welcome!");
        void navigate({ to: "/workspace" });
      })
      .catch((e: unknown) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Failed to accept invitation");
      });
  }, [token, status, accept, navigate]);

  return (
    <PageContainer title="Accept invitation" description="Joining your team">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>
            {status === "working" && "Accepting…"}
            {status === "done" && "You're in!"}
            {status === "error" && "Couldn't accept invitation"}
            {status === "idle" && !token && "Missing invitation token"}
          </CardTitle>
          <CardDescription>
            {status === "error" && (message ?? "Please contact the sender for a new invitation.")}
            {status === "idle" && !token && "The invitation link is missing the token parameter."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => void navigate({ to: "/workspace" })}>Go to workspace</Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
