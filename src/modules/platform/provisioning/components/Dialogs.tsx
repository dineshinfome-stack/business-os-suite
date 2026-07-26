/**
 * Gate 3.4 · Recovery + confirmation dialogs.
 * Presentation only: each dialog renders confirmation copy and delegates the
 * action to the caller.
 */
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ProvisioningErrorDTO } from "../types";

type BaseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending?: boolean;
  correlationId: string;
};

function Shell({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  pending,
  destructive,
  confirmDisabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children?: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  destructive?: boolean;
  confirmDisabled?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Keep as is
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending || confirmDisabled}
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RetryDialog({
  onConfirm,
  correlationId,
  ...base
}: BaseProps & { onConfirm: () => void }) {
  return (
    <Shell
      {...base}
      title="Retry provisioning job"
      description={`The orchestrator resumes from the last failed step. Recorded against correlation ${correlationId}.`}
      confirmLabel="Retry job"
      onConfirm={onConfirm}
    />
  );
}

export function CancelDialog({
  onConfirm,
  correlationId,
  ...base
}: BaseProps & { onConfirm: (reason: string) => void }) {
  const [reason, setReason] = React.useState("Cancelled by platform administrator");
  const reasonId = React.useId();

  return (
    <Shell
      {...base}
      title="Cancel provisioning job"
      description={`Cancelling stops further steps. Recorded against correlation ${correlationId}.`}
      confirmLabel="Cancel job"
      destructive
      confirmDisabled={reason.trim().length < 3}
      onConfirm={() => onConfirm(reason.trim())}
    >
      <div className="space-y-1.5">
        <Label htmlFor={reasonId}>Cancellation reason</Label>
        <Textarea
          id={reasonId}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
    </Shell>
  );
}

export function RollbackDialog({
  onConfirm,
  correlationId,
  ...base
}: BaseProps & { onConfirm: () => void }) {
  return (
    <Shell
      {...base}
      title="Roll back provisioning job"
      description={`Provisioned resources are released in reverse order. This cannot be undone. Recorded against correlation ${correlationId}.`}
      confirmLabel="Roll back job"
      destructive
      onConfirm={onConfirm}
    />
  );
}

export function FailureDetailsDialog({
  open,
  onOpenChange,
  error,
  stepKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: ProvisioningErrorDTO | null;
  stepKey: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Failure details</DialogTitle>
          <DialogDescription>
            {stepKey ? `Failed at step ${stepKey}.` : "No failing step recorded."}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <dl className="space-y-2 rounded-lg border p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Code</dt>
              <dd className="font-mono text-xs">{error.code}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Kind</dt>
              <dd className="font-mono text-xs">{error.kind}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Retryable</dt>
              <dd>{error.retryable ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Message</dt>
              <dd className="mt-1 break-words">{error.message}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No error payload recorded.</p>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
