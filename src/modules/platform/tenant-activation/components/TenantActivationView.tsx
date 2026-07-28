/**
 * Gate 3.8 — Platform Tenant Activation view.
 *
 * Composition only. All readiness truth, counts, eligibility and error
 * classification come from the certified backend contracts.
 */
import * as React from "react";

import { ErrorState } from "@/modules/platform/provisioning/components/States";
import { useTenantActivation } from "../hooks/useTenantActivation";
import {
  ReadinessSummary,
  ReadinessSummarySkeleton,
} from "./ReadinessSummary";
import {
  ReadinessChecklist,
  ReadinessChecklistSkeleton,
} from "./ReadinessChecklist";
import { ActivationPanel } from "./ActivationPanel";
import { ActivationAudit, ActivationAuditSkeleton } from "./ActivationAudit";

export function TenantActivationView({ tenantId }: { tenantId: string }) {
  const { detail, readiness, activity, refresh, activate, invalidateOnboarding } =
    useTenantActivation(tenantId);

  const result = activate.data ?? null;

  /* version_conflict: refresh readiness, never auto-retry. */
  React.useEffect(() => {
    if (result && !result.ok && result.reasonCode === "version_conflict") {
      void invalidateOnboarding();
    }
  }, [result, invalidateOnboarding]);

  if (detail.isError || readiness.isError) {
    return <ErrorState error={detail.error ?? readiness.error} />;
  }

  return (
    <div className="space-y-6">
      {readiness.isPending || !readiness.data ? (
        <ReadinessSummarySkeleton />
      ) : (
        <ReadinessSummary readiness={readiness.data} />
      )}

      {detail.isPending || !detail.data || !readiness.data ? (
        <ReadinessSummarySkeleton />
      ) : (
        <ActivationPanel
          readiness={readiness.data}
          detail={detail.data}
          onRefresh={() => refresh.mutate()}
          refreshPending={refresh.isPending}
          refreshError={refresh.error}
          onActivate={(input) => activate.mutate(input)}
          activatePending={activate.isPending}
          activateError={activate.error}
          result={result}
        />
      )}

      {readiness.isPending || !readiness.data ? (
        <ReadinessChecklistSkeleton />
      ) : (
        <ReadinessChecklist checks={readiness.data.checks} />
      )}

      {activity.isPending || !activity.data ? (
        <ActivationAuditSkeleton />
      ) : (
        <ActivationAudit
          entries={activity.data.entries}
          includesAuditEntries={activity.data.includesAuditEntries}
        />
      )}
    </div>
  );
}
