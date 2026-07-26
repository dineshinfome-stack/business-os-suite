import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listTenants } from "@/lib/tenants/tenants.functions";
import { useProvisioningCommands } from "../hooks/useProvisioningDashboard";

type Step = 0 | 1 | 2 | 3 | 4;

const STEP_TITLES = [
  "Tenant",
  "Organization",
  "Provider",
  "Review",
  "Submit",
] as const;

export function ProvisioningWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const fetchTenants = useServerFn(listTenants);
  const { start } = useProvisioningCommands();
  const [step, setStep] = React.useState<Step>(0);
  const [tenantId, setTenantId] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");

  const tenants = useQuery({
    queryKey: ["provisioning", "wizard", "tenants"],
    queryFn: () => fetchTenants(),
    enabled: open,
  });

  const tenant = tenants.data?.find((t: { id: string }) => t.id === tenantId);
  const canAdvance =
    (step === 0 && Boolean(tenantId)) ||
    (step === 1 && /.+@.+\..+/.test(adminEmail)) ||
    step === 2 ||
    step === 3;

  async function submit() {
    const result = await start.mutateAsync({ tenantId, adminEmail });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onOpenChange(false);
    setStep(0);
    if (result.jobId) {
      navigate({ to: "/platform/provisioning/$jobId", params: { jobId: result.jobId } });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Provision tenant — {STEP_TITLES[step]}</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEP_TITLES.length}
          </DialogDescription>
        </DialogHeader>

        {step === 0 ? (
          <div className="space-y-2">
            <Label>Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                {(tenants.data ?? []).map((t: { id: string; display_name: string }) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-2">
            <Label htmlFor="admin-email">Administrator email</Label>
            <Input
              id="admin-email"
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="admin@example.com"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value="supabase" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supabase">Supabase</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Supabase is currently the only registered provider.
            </p>
          </div>
        ) : null}

        {step >= 3 ? (
          <dl className="space-y-2 rounded-lg border p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tenant</dt>
              <dd>{tenant?.display_name ?? tenantId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Administrator</dt>
              <dd>{adminEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Provider</dt>
              <dd>supabase</dd>
            </div>
          </dl>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            disabled={step === 0 || start.isPending}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => ((s + 1) as Step))}
              disabled={!canAdvance}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={submit} disabled={start.isPending}>
              {start.isPending ? "Starting…" : "Start provisioning"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
