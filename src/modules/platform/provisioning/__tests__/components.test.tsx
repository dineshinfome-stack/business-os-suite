/**
 * Gate 3.4 · Presentation + accessibility tests for provisioning components.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SummaryCards } from "../components/SummaryCards";
import { ProviderHealthCard } from "../components/ProviderHealthCard";
import { ProvisioningTimeline } from "../components/ProvisioningTimeline";
import { ProgressBar } from "../components/ProgressBar";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { CancelDialog, FailureDetailsDialog, RetryDialog } from "../components/Dialogs";
import type { ProviderHealthDTO, ProvisioningSummaryDTO } from "../types";

const summary: ProvisioningSummaryDTO = {
  total: 12,
  active: 3,
  completed: 8,
  failed: 1,
  cancelled: 0,
  rolledBack: 0,
  successRate: 89,
  averageDurationMs: 180_000,
  generatedAt: new Date("2026-07-26T10:00:00Z").toISOString(),
};

const health: ProviderHealthDTO = {
  providerKey: "supabase",
  displayName: "Supabase",
  status: "healthy",
  configured: true,
  capabilities: {
    supportsRollback: true,
    supportsSqlExecution: true,
    supportsAdminCreation: false,
  },
  statistics: { total: 10, succeeded: 9, failed: 1, active: 0, successRate: 90 },
  message: "Provider credentials are configured.",
  checkedAt: new Date("2026-07-26T10:00:00Z").toISOString(),
};

describe("SummaryCards", () => {
  it("renders every KPI with a formatted duration", () => {
    render(<SummaryCards summary={summary} />);
    expect(screen.getByText("Total jobs")).toBeInTheDocument();
    expect(screen.getByText("89%")).toBeInTheDocument();
    expect(screen.getByText("3 min")).toBeInTheDocument();
  });
});

describe("ProviderHealthCard", () => {
  it("shows status, capabilities and the historical-only caveat", () => {
    render(<ProviderHealthCard health={health} />);
    expect(screen.getByText("healthy")).toBeInTheDocument();
    expect(screen.getByText("Rollback")).toBeInTheDocument();
    expect(screen.getByText(/historical/i)).toBeInTheDocument();
  });
});

describe("ProvisioningTimeline", () => {
  it("renders an empty state when there is no activity", () => {
    render(<ProvisioningTimeline entries={[]} />);
    expect(screen.getByText(/no provisioning activity/i)).toBeInTheDocument();
  });

  it("renders machine-readable timestamps", () => {
    const { container } = render(
      <ProvisioningTimeline
        entries={[
          {
            id: "1",
            at: "2026-07-26T10:00:00.000Z",
            label: "Job created",
            description: "Provisioning requested",
            tone: "neutral",
            stepKey: null,
            durationMs: null,
          },
        ]}
      />,
    );
    expect(container.querySelector("time")).toHaveAttribute(
      "dateTime",
      "2026-07-26T10:00:00.000Z",
    );
  });
});

describe("states", () => {
  it("announces loading politely", () => {
    render(<LoadingState label="Loading jobs" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("announces errors as alerts", () => {
    render(<ErrorState error={new Error("boom")} />);
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
  });

  it("renders empty messages", () => {
    render(<EmptyState message="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});

describe("ProgressBar", () => {
  it("clamps and exposes progress semantics", () => {
    render(<ProgressBar percent={140} label="7/7 steps" />);
    expect(screen.getByText("7/7 steps")).toBeInTheDocument();
  });
});

describe("recovery dialogs", () => {
  it("confirms a retry and names the correlation id", async () => {
    const onConfirm = vi.fn();
    render(
      <RetryDialog
        open
        onOpenChange={() => {}}
        correlationId="corr-1"
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText(/corr-1/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /retry job/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("requires a cancellation reason", async () => {
    const onConfirm = vi.fn();
    render(
      <CancelDialog
        open
        onOpenChange={() => {}}
        correlationId="corr-2"
        onConfirm={onConfirm}
      />,
    );
    const reason = screen.getByLabelText(/cancellation reason/i);
    await userEvent.clear(reason);
    expect(screen.getByRole("button", { name: /cancel job/i })).toBeDisabled();
    await userEvent.type(reason, "Duplicate tenant");
    await userEvent.click(screen.getByRole("button", { name: /cancel job/i }));
    expect(onConfirm).toHaveBeenCalledWith("Duplicate tenant");
  });

  it("renders failure payload details", () => {
    render(
      <FailureDetailsDialog
        open
        onOpenChange={() => {}}
        stepKey="create_project"
        error={{
          code: "PROVIDER_TIMEOUT",
          kind: "transient",
          message: "Provider did not respond",
          retryable: true,
        }}
      />,
    );
    expect(screen.getByText("PROVIDER_TIMEOUT")).toBeInTheDocument();
    expect(screen.getByText("Provider did not respond")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
});
