/**
 * Gate 3.8 — Tenant activation data access.
 *
 * Thin binding over the CERTIFIED onboarding read facade and command facade.
 * No readiness derivation happens here: counts, statuses, overall verdict and
 * eligibility all arrive from the database evaluator.
 */
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  getTenantOnboardingActivity,
  getTenantOnboardingDetail,
  getTenantOnboardingReadiness,
} from "@/lib/tenant-onboarding/queries.functions";
import {
  activateTenant,
  refreshTenantOnboardingReadiness,
} from "@/lib/tenant-onboarding/commands.functions";
import { tenantOnboardingKeys } from "@/lib/tenant-onboarding/query-keys";
import { useAuth } from "@/contexts/auth-context";

export function useTenantActivation(tenantId: string) {
  const auth = useAuth();
  const enabled = auth.status === "authenticated" && Boolean(tenantId);
  const qc = useQueryClient();

  const detailFn = useServerFn(getTenantOnboardingDetail);
  const readinessFn = useServerFn(getTenantOnboardingReadiness);
  const activityFn = useServerFn(getTenantOnboardingActivity);
  const refreshFn = useServerFn(refreshTenantOnboardingReadiness);
  const activateFn = useServerFn(activateTenant);

  const detail = useQuery({
    queryKey: tenantOnboardingKeys.detail(tenantId),
    queryFn: () => detailFn({ data: { tenantId } }),
    enabled,
  });

  const readiness = useQuery({
    queryKey: tenantOnboardingKeys.readiness(tenantId),
    queryFn: () => readinessFn({ data: { tenantId } }),
    enabled,
  });

  const activity = useQuery({
    queryKey: tenantOnboardingKeys.activity(tenantId),
    queryFn: () => activityFn({ data: { tenantId } }),
    enabled,
  });

  /** Refresh exactly the tenant-onboarding surfaces — nothing global. */
  const invalidateOnboarding = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: tenantOnboardingKeys.readiness(tenantId) }),
      qc.invalidateQueries({ queryKey: tenantOnboardingKeys.detail(tenantId) }),
      qc.invalidateQueries({ queryKey: tenantOnboardingKeys.activity(tenantId) }),
    ]);
  }, [qc, tenantId]);

  const refresh = useMutation({
    mutationFn: () => refreshFn({ data: { tenantId } }),
    onSuccess: invalidateOnboarding,
  });

  const activate = useMutation({
    mutationFn: (input: { expectedVersion: number; acknowledgeWarnings: boolean }) =>
      activateFn({
        data: {
          tenantId,
          expectedVersion: input.expectedVersion,
          acknowledgeWarnings: input.acknowledgeWarnings,
        },
      }),
    onSuccess: async (result) => {
      /* Both success and a guarded refusal change what the operator must see:
         re-read onboarding state, and the tenant lifecycle read model too. */
      await invalidateOnboarding();
      if (result?.ok) {
        await qc.invalidateQueries({ queryKey: ["platform", "tenant", tenantId] });
        await qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
      }
    },
  });

  return { detail, readiness, activity, refresh, activate, invalidateOnboarding };
}
