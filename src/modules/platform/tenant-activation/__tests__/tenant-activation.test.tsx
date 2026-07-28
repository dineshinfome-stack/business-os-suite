/**
 * Gate 3.8 — Platform Tenant Activation UI tests.
 *
 * Presentation-only assertions. The certified backend contracts are
 * substituted, never re-implemented — which is precisely what proves the
 * frontend does not derive readiness on its own.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { READINESS_CHECK_KEYS } from "@/lib/tenant-onboarding/readiness";
import type {
  OnboardingActivationResultDTO,
  TenantOnboardingDetailDTO,
  TenantOnboardingReadinessCheckDTO,
  TenantOnboardingReadinessDTO,
} from "@/lib/tenant-onboarding/types/v1";

const permissions = { granted: true };

vi.mock("@/contexts/permissions-context", () => ({
  usePermissions: () => ({
    ready: true,
    has: () => permissions.granted,
    hasAny: () => permissions.granted,
    hasAll: () => permissions.granted,
  }),
}));

const { ActivationPanel } = await import("../components/ActivationPanel");
const { ReadinessChecklist } = await import("../components/ReadinessChecklist");

/* ------------------------------------------------------------- fixtures */

function makeCheck(
  checkKey: string,
  overrides: Partial<TenantOnboardingReadinessCheckDTO> = {},
): TenantOnboardingReadinessCheckDTO {
  return {
    checkKey,
    label: `Check ${checkKey}`,
    classification: "mandatory",
    status: "pass",
    owningModule: "platform/onboarding",
    stepKey: null,
    reasonCode: "satisfied",
    reasonParams: {},
    explanation: `Explanation for ${checkKey}`,
    deepLink: null,
    evaluatedAt: "2026-07-28T08:00:00.000Z",
    ...overrides,
  };
}

function makeReadiness(
  overrides: Partial<TenantOnboardingReadinessDTO> = {},
): TenantOnboardingReadinessDTO {
  return {
    evaluationStatus: "evaluated",
    overallStatus: "ready",
    evaluatedAt: "2026-07-28T08:00:00.000Z",
    workflowVersion: "3.8.5",
    checks: READINESS_CHECK_KEYS.map((k) => makeCheck(k)),
    blockingCount: 0,
    warningCount: 0,
    correlationId: "corr-1",
    tenantId: "tenant-1",
    applicableCount: 14,
    warningFingerprint: null,
    observedWorkflowVersion: 7,
    contractVersion: "3.8.5",
    ...overrides,
  };
}

function makeDetail(
  overrides: Partial<TenantOnboardingDetailDTO> = {},
): TenantOnboardingDetailDTO {
  return {
    summary: {
      tenantId: "tenant-1",
      tenantName: "Acme Corp",
      tenantSlug: "acme",
      tenantCode: null,
      state: "ready",
      progressPercent: 100,
      currentStepKey: null,
      blockerCount: 0,
      blockerSummary: null,
      invitationStatus: "accepted",
      readinessEvaluationStatus: "evaluated",
      readinessOverallStatus: "ready",
      startedAt: "2026-07-27T08:00:00.000Z",
      updatedAt: "2026-07-28T08:00:00.000Z",
      readyAt: "2026-07-28T08:00:00.000Z",
      activatedAt: null,
      persisted: true,
    } as TenantOnboardingDetailDTO["summary"],
    organization: null,
    primaryBranch: null,
    adminInvitation: null,
    adminMembership: null,
    steps: [],
    progress: {} as TenantOnboardingDetailDTO["progress"],
    blockers: [],
    readiness: makeReadiness(),
    availableActions: [],
    version: 7,
    persisted: true,
    ...overrides,
  };
}

function makeResult(
  overrides: Partial<OnboardingActivationResultDTO> = {},
): OnboardingActivationResultDTO {
  return {
    ok: true,
    tenantId: "tenant-1",
    state: "activated",
    activatedAt: "2026-07-28T09:00:00.000Z",
    lifecycleTransitionApplied: true,
    idempotentReplay: false,
    blockingCount: 0,
    warningCount: 0,
    reasonCode: null,
    message: "The tenant was activated.",
    correlationId: "corr-2",
    version: 8,
    warningsAcknowledged: false,
    warningFingerprint: null,
    ...overrides,
  };
}

function renderPanel(props: Partial<React.ComponentProps<typeof ActivationPanel>> = {}) {
  const onActivate = vi.fn();
  const onRefresh = vi.fn();
  render(
    <ActivationPanel
      readiness={makeReadiness()}
      detail={makeDetail()}
      onRefresh={onRefresh}
      refreshPending={false}
      refreshError={null}
      onActivate={onActivate}
      activatePending={false}
      activateError={null}
      result={null}
      {...props}
    />,
  );
  return { onActivate, onRefresh };
}

beforeEach(() => {
  permissions.granted = true;
  vi.clearAllMocks();
});

/* ---------------------------------------------------------------- tests */

describe("readiness checklist", () => {
  it("renders all fourteen checks in the backend-supplied order", () => {
    const backendOrder = [...READINESS_CHECK_KEYS].reverse();
    render(
      <ReadinessChecklist checks={backendOrder.map((k) => makeCheck(k))} />,
    );
    const rendered = Array.from(
      screen.getByTestId("readiness-checklist").querySelectorAll("li"),
    ).map((li) => li.getAttribute("data-check-key"));

    expect(rendered).toHaveLength(14);
    /* Order mirrors the payload exactly — no local re-sorting. */
    expect(rendered).toEqual(backendOrder);
  });

  it("shows status, classification, reason code and remediation guidance", () => {
    render(
      <ReadinessChecklist
        checks={[
          makeCheck("organization_exists", {
            status: "blocked",
            classification: "mandatory",
            reasonCode: "organization_missing",
            explanation: "Create the tenant's default organization.",
            deepLink: "/platform/companies",
          }),
        ]}
      />,
    );
    const row = screen.getByTestId("readiness-checklist").querySelector("li")!;
    expect(within(row).getByText("Blocked")).toBeInTheDocument();
    expect(within(row).getByText("mandatory")).toBeInTheDocument();
    expect(within(row).getByText("organization_missing")).toBeInTheDocument();
    expect(
      within(row).getByText("Create the tenant's default organization."),
    ).toBeInTheDocument();
    expect(within(row).getByRole("link")).toHaveAttribute(
      "href",
      "/platform/companies",
    );
  });
});

describe("activation guards", () => {
  it("prevents activation while blocking checks exist", () => {
    renderPanel({
      readiness: makeReadiness({ blockingCount: 3, overallStatus: "not_ready" }),
    });
    expect(screen.getByRole("button", { name: /activate tenant/i })).toBeDisabled();
  });

  it("allows an authorized operator to activate a ready tenant", async () => {
    const user = userEvent.setup();
    const { onActivate } = renderPanel();
    await user.click(screen.getByRole("button", { name: /activate tenant/i }));
    await user.click(screen.getByRole("button", { name: /confirm activation/i }));
    expect(onActivate).toHaveBeenCalledWith({
      expectedVersion: 7,
      acknowledgeWarnings: false,
    });
  });

  it("always submits the latest expectedVersion", async () => {
    const user = userEvent.setup();
    const { onActivate } = renderPanel({ detail: makeDetail({ version: 42 }) });
    await user.click(screen.getByRole("button", { name: /activate tenant/i }));
    await user.click(screen.getByRole("button", { name: /confirm activation/i }));
    expect(onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ expectedVersion: 42 }),
    );
  });

  it("requires acknowledgement when warnings are present", async () => {
    const user = userEvent.setup();
    const { onActivate } = renderPanel({
      readiness: makeReadiness({
        warningCount: 2,
        overallStatus: "ready_with_warnings",
      }),
    });
    await user.click(screen.getByRole("button", { name: /activate tenant/i }));
    const confirm = screen.getByRole("button", { name: /confirm activation/i });
    expect(confirm).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(confirm).toBeEnabled());
    await user.click(confirm);
    expect(onActivate).toHaveBeenCalledWith({
      expectedVersion: 7,
      acknowledgeWarnings: true,
    });
  });

  it("hides the activation action from an unauthorized operator", () => {
    permissions.granted = false;
    renderPanel();
    expect(
      screen.queryByRole("button", { name: /activate tenant/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/read-only access/i)).toBeInTheDocument();
  });

  it("disables duplicate activation once the tenant is active", () => {
    renderPanel({
      detail: makeDetail({
        summary: {
          ...makeDetail().summary,
          state: "activated",
          activatedAt: "2026-07-28T09:00:00.000Z",
        },
      }),
    });
    expect(screen.getByRole("button", { name: /activate tenant/i })).toBeDisabled();
    expect(screen.getByText(/already activated/i)).toBeInTheDocument();
  });
});

describe("activation outcomes", () => {
  it("reports success with lifecycle state, timestamp and idempotency", () => {
    renderPanel({ result: makeResult() });
    const success = screen.getByTestId("activation-success");
    expect(within(success).getByText(/lifecycle state: active/i)).toBeInTheDocument();
    expect(within(success).getByText(/activated at/i)).toBeInTheDocument();
    expect(within(success).getByText(/idempotent/i)).toBeInTheDocument();
  });

  it.each([
    ["readiness_blocked", /blocking readiness checks failed/i],
    ["warning_acknowledgement_required", /acknowledge the outstanding warnings/i],
    ["lifecycle_state_blocks", /lifecycle state does not permit/i],
    ["permission_denied", /do not have permission/i],
  ])("maps the %s command error", (reasonCode, matcher) => {
    renderPanel({ result: makeResult({ ok: false, reasonCode }) });
    expect(
      within(screen.getByTestId("activation-failure")).getByText(matcher),
    ).toBeInTheDocument();
  });

  it("explains a version conflict without auto-retrying", () => {
    const { onActivate } = renderPanel({
      result: makeResult({ ok: false, reasonCode: "version_conflict" }),
    });
    const failure = screen.getByTestId("activation-failure");
    expect(within(failure).getByText(/tenant state changed/i)).toBeInTheDocument();
    expect(
      within(failure).getByText(/no automatic retry was attempted/i),
    ).toBeInTheDocument();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("never exposes SQLSTATE values in operator messaging", () => {
    renderPanel({ result: makeResult({ ok: false, reasonCode: "readiness_blocked" }) });
    expect(document.body.textContent).not.toMatch(/P384|40001|42501/);
  });
});

describe("refresh readiness", () => {
  it("invokes the persist-readiness command without activating", async () => {
    const user = userEvent.setup();
    const { onRefresh, onActivate } = renderPanel();
    await user.click(screen.getByRole("button", { name: /refresh readiness/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("surfaces refresh loading and error states", () => {
    renderPanel({ refreshPending: true, refreshError: new Error("boom") });
    expect(screen.getByRole("button", { name: /refresh readiness/i })).toBeDisabled();
    expect(screen.getByText(/re-evaluating readiness/i)).toBeInTheDocument();
    expect(screen.getByText(/readiness refresh failed/i)).toBeInTheDocument();
  });
});

describe("authority boundary", () => {
  it("does not recompute readiness counts or the overall verdict", async () => {
    /* The payload deliberately disagrees with what a local calculation would
       produce: every check passes, yet the backend reports blockers. The UI
       must obey the backend. */
    const source = await import("../components/ActivationPanel?raw");
    const text = String((source as { default: string }).default ?? "");
    expect(text).not.toMatch(/checks\.filter\([^)]*blocked/);

    renderPanel({
      readiness: makeReadiness({ blockingCount: 1, overallStatus: "not_ready" }),
    });
    expect(screen.getByRole("button", { name: /activate tenant/i })).toBeDisabled();
  });
});
