/**
 * Gate 3.6 — Lifecycle action bar.
 * Renders only the operations structurally available from the current state,
 * each gated by its own permission. Reason capture is enforced client-side
 * and re-enforced by the database.
 */
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Can } from "@/components/auth/Can";
import {
  availableOperations,
  DEFAULT_RETENTION_DAYS,
  type LifecycleOperation,
  type LifecycleOperationSpec,
  type TenantLifecycleState,
} from "@/lib/tenant-lifecycle/lifecycle";

export interface LifecycleActionPayload {
  operation: LifecycleOperation;
  reason: string;
  retentionDays: number;
}

export function LifecycleActions({
  state,
  pending,
  onRun,
}: {
  state: TenantLifecycleState;
  pending?: boolean;
  onRun: (payload: LifecycleActionPayload) => void;
}) {
  const [active, setActive] = React.useState<LifecycleOperationSpec | null>(null);
  const [reason, setReason] = React.useState("");
  const [retentionDays, setRetentionDays] = React.useState(DEFAULT_RETENTION_DAYS);

  const operations = availableOperations(state);

  const open = (spec: LifecycleOperationSpec) => {
    setReason("");
    setRetentionDays(DEFAULT_RETENTION_DAYS);
    setActive(spec);
  };

  const confirm = () => {
    if (!active) return;
    onRun({ operation: active.operation, reason: reason.trim(), retentionDays });
    setActive(null);
  };

  if (operations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No lifecycle operations are available from this state.
      </p>
    );
  }

  const reasonInvalid = active?.requiresReason ? reason.trim().length < 3 : false;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {operations.map((spec) => (
          <Can key={spec.operation} permission={spec.permission}>
            <Button
              variant={spec.destructive ? "destructive" : "secondary"}
              disabled={pending}
              onClick={() => open(spec)}
              data-testid={`lifecycle-op-${spec.operation}`}
            >
              {spec.label}
            </Button>
          </Can>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.label}</DialogTitle>
            <DialogDescription>
              {active?.operation === "delete"
                ? "Soft delete: the tenant record and all history are retained and marked for a later purge. This cannot be undone from the console."
                : `The tenant moves to "${active?.target}".`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {active?.requiresReason && (
              <div className="space-y-2">
                <Label htmlFor="lifecycle-reason">Reason</Label>
                <Textarea
                  id="lifecycle-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Recorded in the tenant audit trail"
                />
              </div>
            )}
            {active?.operation === "schedule_deletion" && (
              <div className="space-y-2">
                <Label htmlFor="lifecycle-retention">Retention (days)</Label>
                <Input
                  id="lifecycle-retention"
                  type="number"
                  min={1}
                  max={3650}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button
              variant={active?.destructive ? "destructive" : "default"}
              disabled={reasonInvalid || pending}
              onClick={confirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
