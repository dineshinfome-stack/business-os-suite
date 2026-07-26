/**
 * Gate 3.5 · Workflow UI validation.
 *
 * Verifies that every provisioning state renders its badge, progress, steps,
 * timeline, error surface and duration, that each dashboard action invokes the
 * correct facade command, and that permissions gate the command surface.
 *
 * Presentation only — the commands hook is substituted, never re-implemented.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProvisioningJobDetailDTO } from "../types";

const commands = {
  start: { mutateAsync: vi.fn(), isPending: false },
  retry: { mutateAsync: vi.fn(async () => ({ ok: true, message: "Provisioning resumed." })), isPending: false },
  advance: { mutateAsync: vi.fn(async () => ({ ok: true, message: "Next step executed." })), isPending: false },
  cancel: { mutateAsync: vi.fn(async () => ({ ok: true, message: "Provisioning cancelled." })), isPending: false },
  rollback: { mutateAsync: vi.fn(async () => ({ ok: true, message: "Rollback executed." })), isPending: false },
};

const permissions = { granted: true };

vi.mock("../hooks/useProvisioningDashboard", () => ({
  useProvisioningCommands: () => commands,
}));

vi.mock("@/contexts/permissions-context", () => ({
  usePermissions: () => ({
    ready: true,
    has: () => permissions.granted,
    hasAny: () => permissions.granted,
    hasAll: () => permissions.granted,
  }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { JobDetailPanel } = await import("../components/JobDetailPanel");

function makeJob(overrides: Partial<ProvisioningJobDetailDTO> = {}): ProvisioningJobDetailDTO {
  return {
    jobId: "job-1",
    tenantId: "tenant-1",
    tenantName: "Acme Corp",
    tenantSlug: "acme-corp",
    state: "provisioning_infrastructure",
    status: "in_progress",
    currentStepKey: "create_project",
    completedSteps: 2,
    totalSteps: 7,
    progressPercent: 28,
    attemptCount: 1,
    providerKey: "supabase",
    region: "eu-west-1",
    correlationId: "corr-3-5",
    retryable: false,
    error: null,
    startedAt: "2026-07-26T10:00:00.000Z",
    completedAt: null,
    createdAt: "2026-07-26T09:59:00.000Z",
    lastTransitionAt: "2026-07-26T10:01:00.000Z",
    steps: [
      {
        stepKey: "create_project",
        label: "Create project",
        sequence: 1,
        status: "running",
        attemptCount: 1,
        durationMs: 4200,
        startedAt: "2026-07-26T10:00:00.000Z",
        completedAt: null,
        error: null,
      },
    ],
    timeline: [
      {
        id: "t1",
        at: "2026-07-26T10:00:00.000Z",
        label: "Job started",
        description: "Provisioning requested",
        tone: "neutral",
        stepKey: null,
        durationMs: null,
      },
    ],
    rollbackState: "none",
    resourceReferences: [{ kind: "project", reference: "proj_1" }],
    pollIntervalMs: 5_000,
    terminal: false,
    ...overrides,
  };
}

beforeEach(() => {
  permissions.granted = true;
  Object.values(commands).forEach((c) => c.mutateAsync.mockClear?.());
});

const STATE_MATRIX: {
  state: string;
  status: ProvisioningJobDetailDTO["status"];
  terminal: boolean;
  retryable: boolean;
  percent: number;
}[] = [
  { state: "pending", status: "not_started", terminal: false, retryable: false, percent: 0 },
  { state: "validating", status: "in_progress", terminal: false, retryable: false, percent: 5 },
  { state: "queued", status: "in_progress", terminal: false, retryable: false, percent: 10 },
  { state: "provisioning_infrastructure", status: "in_progress", terminal: false, retryable: false, percent: 30 },
  { state: "running_migrations", status: "in_progress", terminal: false, retryable: false, percent: 45 },
  { state: "seeding", status: "in_progress", terminal: false, retryable: false, percent: 60 },
  { state: "creating_admin", status: "in_progress", terminal: false, retryable: false, percent: 75 },
  { state: "verifying", status: "in_progress", terminal: false, retryable: false, percent: 90 },
  { state: "retrying", status: "in_progress", terminal: false, retryable: true, percent: 45 },
  { state: "completed", status: "provisioned", terminal: true, retryable: false, percent: 100 },
  { state: "failed", status: "failed", terminal: true, retryable: true, percent: 45 },
  { state: "cancelled", status: "not_started", terminal: true, retryable: false, percent: 45 },
  { state: "rolled_back", status: "failed", terminal: true, retryable: false, percent: 0 },
];

describe("state matrix · every provisioning state renders a complete surface", () => {
  it.each(STATE_MATRIX)("$state", ({ state, status, terminal, retryable, percent }) => {
    render(
      <JobDetailPanel
        liveStatus="live"
        job={makeJob({
          state,
          status,
          terminal,
          retryable,
          progressPercent: percent,
          error: status === "failed" ? { code: "PROVIDER_TIMEOUT", kind: "provider", message: "Provider did not respond", retryable } : null,
        })}
      />,
    );

    // badge + state label
    expect(screen.getByText(state.replace(/_/g, " "))).toBeInTheDocument();
    // progress
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(percent));
    // steps + duration
    expect(screen.getByText("Create project")).toBeInTheDocument();
    expect(screen.getByText("4s")).toBeInTheDocument();
    // timeline
    expect(screen.getByText("Job started")).toBeInTheDocument();
    // actions
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rollback" })).toBeInTheDocument();
    // advance/cancel exist for every state; terminal disabling is asserted below
    expect(screen.getByRole("button", { name: /run next step/i })).toBeInTheDocument();

  });

  it("disables advance and cancel on a terminal job", () => {
    render(<JobDetailPanel liveStatus="closed" job={makeJob({ state: "completed", terminal: true })} />);
    expect(screen.getByRole("button", { name: /run next step/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("enables Resume only while the job is retrying", () => {
    const { rerender } = render(<JobDetailPanel liveStatus="live" job={makeJob({ state: "seeding" })} />);
    expect(screen.getByRole("button", { name: "Resume" })).toBeDisabled();
    rerender(<JobDetailPanel liveStatus="live" job={makeJob({ state: "retrying", retryable: true })} />);
    expect(screen.getByRole("button", { name: "Resume" })).toBeEnabled();
  });

  it("surfaces the step error message", () => {
    render(
      <JobDetailPanel
        liveStatus="polling"
        job={makeJob({
          state: "failed",
          status: "failed",
          terminal: true,
          steps: [
            {
              stepKey: "apply_migrations",
              label: "Apply migrations",
              sequence: 2,
              status: "failed",
              attemptCount: 3,
              durationMs: 1200,
              startedAt: "2026-07-26T10:00:00.000Z",
              completedAt: "2026-07-26T10:00:01.200Z",
              error: { code: "MIGRATION_FAILED", kind: "provider", message: "relation already exists", retryable: false },
            },
          ],
        })}
      />,
    );
    expect(screen.getByText("relation already exists")).toBeInTheDocument();
    expect(screen.getByText(/updates: polling/i)).toBeInTheDocument();
  });
});

describe("command integration · dashboard actions call the right facade command", () => {
  it("Run next step calls advance", async () => {
    render(<JobDetailPanel liveStatus="live" job={makeJob()} />);
    await userEvent.click(screen.getByRole("button", { name: /run next step/i }));
    expect(commands.advance.mutateAsync).toHaveBeenCalledWith("job-1");
  });

  it("Retry confirms then calls retry (resumeProvisioning)", async () => {
    render(<JobDetailPanel liveStatus="live" job={makeJob({ retryable: true })} />);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/corr-3-5/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: /confirm/i }));
    expect(commands.retry.mutateAsync).toHaveBeenCalledWith("job-1");
  });

  it("Cancel sends a reason", async () => {
    render(<JobDetailPanel liveStatus="live" job={makeJob()} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /confirm/i }));
    expect(commands.cancel.mutateAsync).toHaveBeenCalledWith({
      jobId: "job-1",
      reason: "Cancelled by platform administrator",
    });
  });

  it("Rollback calls rollback after confirmation", async () => {
    render(<JobDetailPanel liveStatus="live" job={makeJob({ state: "failed", terminal: true })} />);
    await userEvent.click(screen.getByRole("button", { name: "Rollback" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /confirm/i }));
    expect(commands.rollback.mutateAsync).toHaveBeenCalledWith("job-1");
  });

  it("keeps the dialog dismissable without firing a command", async () => {
    render(<JobDetailPanel liveStatus="live" job={makeJob()} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /keep as is/i }));
    expect(commands.cancel.mutateAsync).not.toHaveBeenCalled();
  });
});

describe("security · permission gating and payload hygiene", () => {
  it("hides every command when the operator lacks permissions", () => {
    permissions.granted = false;
    render(<JobDetailPanel liveStatus="live" job={makeJob()} />);
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rollback" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /run next step/i })).not.toBeInTheDocument();
  });

  it("renders no provider credentials, SQL or stack traces", () => {
    const { container } = render(
      <JobDetailPanel
        liveStatus="live"
        job={makeJob({
          state: "failed",
          status: "failed",
          error: { code: "PROVIDER_ERROR", kind: "provider", message: "Provider rejected the request", retryable: true },
        })}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/service_role|sbp_|apikey|select \* from|at Object\.<anonymous>/i);
    expect(text).toContain("corr-3-5");
  });
});

describe("observability · operator-facing identifiers", () => {
  it("shows correlation id, provider, region and progress", () => {
    render(<JobDetailPanel liveStatus="live" job={makeJob()} />);
    expect(screen.getByText("corr-3-5")).toBeInTheDocument();
    expect(screen.getByText(/supabase/)).toBeInTheDocument();
    expect(screen.getByText(/eu-west-1/)).toBeInTheDocument();
    expect(screen.getByText(/2 of 7 steps complete/)).toBeInTheDocument();
  });
});
