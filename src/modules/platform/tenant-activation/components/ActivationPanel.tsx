/**
 * Gate 3.8 — Activation panel.
 *
 * Owns the Refresh readiness action, the guarded Activate tenant dialog and
 * the activation result surface. Every decision (blocked / warnings /
 * lifecycle / version) is taken FROM the certified backend payload.
 */
import * as React from "react";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermissions } from "@/contexts/permissions-context";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import type {
  OnboardingActivationResultDTO,
  TenantOnboardingDetailDTO,
  TenantOnboardingReadinessDTO,
} from "@/lib/tenant-onboarding/types/v1";
import { activationReasonText } from "../reason-text";

interface Props {
  readiness: TenantOnboardingReadinessDTO;
  detail: TenantOnboardingDetailDTO;
  onRefresh: () => void;
  refreshPending: boolean;
  refreshError: unknown;
  onActivate: (input: {
    expectedVersion: number;
    acknowledgeWarnings: boolean;
  }) => void;
  activatePending: boolean;
  activateError: unknown;
  result: OnboardingActivationResultDTO | null;
}

export function ActivationPanel({
  readiness,
  detail,
  onRefresh,
  refreshPending,
  refreshError,
  onActivate,
  activatePending,
  activateError,
  result,
}: Props) {
  const { has } = usePermissions();
  const canActivate = has(PERMISSIONS.PLATFORM_TENANT_ACTIVATE);

  const [open, setOpen] = React.useState(false);
  const [acknowledged, setAcknowledged] = React.useState(false);

  const expectedVersion = detail.version;
  const alreadyActive =
    detail.summary.state === "activated" || Boolean(detail.summary.activatedAt);
  const blocked = readiness.blockingCount > 0;
  const warningsPresent = readiness.warningCount > 0;
  const acknowledgementSatisfied = !warningsPresent || acknowledged;

  const disabledReason = alreadyActive
    ? "This tenant is already activated. Activation is idempotent — repeating it would change nothing."
    : expectedVersion === null
      ? "The onboarding workflow is not persisted yet, so there is no version to guard the activation with."
      : blocked
        ? "Blocking readiness checks must be resolved before activation."
        : null;

  const activationDisabled =
    !canActivate || activatePending || alreadyActive || disabledReason !== null;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Activation</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshPending}
          >
            {refreshPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
            Refresh readiness
          </Button>
          {canActivate && (
            <Button
              type="button"
              onClick={() => {
                setAcknowledged(false);
                setOpen(true);
              }}
              disabled={activationDisabled}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Activate tenant
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {refreshPending
            ? "Re-evaluating readiness…"
            : disabledReason ??
              (warningsPresent
                ? "This tenant is ready with warnings. Activation requires explicit acknowledgement."
                : "This tenant is ready for activation.")}
        </p>

        {!canActivate && (
          <Alert>
            <AlertTitle>Read-only access</AlertTitle>
            <AlertDescription>
              You can review readiness, but activation requires the{" "}
              {PERMISSIONS.PLATFORM_TENANT_ACTIVATE} permission.
            </AlertDescription>
          </Alert>
        )}

        {Boolean(refreshError) && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Readiness refresh failed</AlertTitle>
            <AlertDescription>
              The readiness evaluation could not be completed. Try again.
            </AlertDescription>
          </Alert>
        )}

        {Boolean(activateError) && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Activation failed</AlertTitle>
            <AlertDescription>
              {activationReasonText("command_failed")}
            </AlertDescription>
          </Alert>
        )}

        {result && !result.ok && (
          <Alert variant="destructive" role="alert" data-testid="activation-failure">
            <AlertTitle>Activation refused</AlertTitle>
            <AlertDescription>
              {activationReasonText(result.reasonCode)}
            </AlertDescription>
          </Alert>
        )}

        {result?.ok && (
          <Alert data-testid="activation-success">
            <AlertTitle>
              {result.idempotentReplay
                ? "Tenant already active"
                : "Tenant activated"}
            </AlertTitle>
            <AlertDescription>
              <span>Lifecycle state: active.</span>{" "}
              {result.activatedAt && (
                <span>
                  Activated at {new Date(result.activatedAt).toLocaleString()}.
                </span>
              )}{" "}
              <span>
                {result.idempotentReplay
                  ? "This was an idempotent replay — no state changed."
                  : "Repeating activation is idempotent and will not change state."}
              </span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate {detail.summary.tenantName}?</DialogTitle>
            <DialogDescription>
              This activates the tenant and makes it available to its users.
              Activation is guarded by the server: readiness is re-evaluated
              inside the same transaction, and the request is submitted with
              workflow version {String(expectedVersion)}.
            </DialogDescription>
          </DialogHeader>

          {warningsPresent && (
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="acknowledge-warnings"
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
              />
              <Label
                htmlFor="acknowledge-warnings"
                className="text-sm font-normal leading-snug"
              >
                I acknowledge the {readiness.warningCount} outstanding warning
                {readiness.warningCount === 1 ? "" : "s"} and want to activate
                this tenant anyway.
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                activatePending ||
                !acknowledgementSatisfied ||
                expectedVersion === null
              }
              onClick={() => {
                if (expectedVersion === null) return;
                onActivate({
                  expectedVersion,
                  acknowledgeWarnings: warningsPresent && acknowledged,
                });
                setOpen(false);
              }}
            >
              {activatePending && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              Confirm activation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
