/**
 * Platform Tenant Administration Dashboard — presentation tests.
 *
 * The backend directory read model is substituted, never re-implemented:
 * the dashboard must render exactly what the server composed.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type {
  PlatformTenantDirectorySummaryDTO,
  PlatformTenantOperationsRowDTO,
} from "@/modules/platform/administration/types";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: any) => <a {...rest}>{children}</a>,
}));

const { TenantAdminSummary } = await import("../components/TenantAdminSummary");
const { TenantAdminTable } = await import("../components/TenantAdminTable");

function makeRow(
  overrides: Partial<PlatformTenantOperationsRowDTO> = {},
): PlatformTenantOperationsRowDTO {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    displayName: "Acme Holdings",
    slug: "acme-holdings",
    code: "ACME",
    region: "ap-south-1",
    planTier: "standard",
    lifecycleState: "created",
    provisioningStatus: "provisioned",
    companyCount: 2,
    lastActivityAt: "2026-07-28T00:00:00.000Z",
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    attentionCount: 0,
    highestSeverity: null,
    organizationCount: 2,
    branchCount: 3,
    onboardingState: "in_progress",
    onboardingProgressPercent: 42,
    readinessStatus: "blocked",
    readinessBlockingCount: 4,
    readinessWarningCount: 1,
    lastReadinessCheckedAt: "2026-07-27T00:00:00.000Z",
    invitationStatus: "pending",
    activatedAt: null,
    ...overrides,
  };
}

const summary: PlatformTenantDirectorySummaryDTO = {
  total: 12,
  active: 5,
  onboarding: 4,
  activationReady: 2,
  blocked: 3,
  suspended: 1,
  provisioningFailures: 2,
};

describe("TenantAdminSummary", () => {
  it("renders every backend counter without local derivation", () => {
    render(<TenantAdminSummary summary={summary} />);
    const band = screen.getByTestId("tenant-admin-summary");
    for (const [key, value] of Object.entries(summary)) {
      expect(
        within(band).getByText(String(value), {
          selector: `[data-summary-key="${key}"]`,
        }),
      ).toBeInTheDocument();
    }
  });
});

describe("TenantAdminTable", () => {
  it("renders backend-composed operational columns for each row", () => {
    render(
      <TenantAdminTable
        rows={[makeRow()]}
        sortBy="createdAt"
        sortDir="desc"
        onSort={() => {}}
      />,
    );
    const row = screen.getByTestId("tenant-admin-table").querySelector(
      '[data-tenant-id="11111111-1111-1111-1111-111111111111"]',
    ) as HTMLElement;
    expect(within(row).getByText("Acme Holdings")).toBeInTheDocument();
    expect(within(row).getByText("in progress")).toBeInTheDocument();
    expect(within(row).getByText("42%")).toBeInTheDocument();
    expect(within(row).getByText("blocked")).toBeInTheDocument();
    expect(within(row).getByText("4")).toBeInTheDocument();
    expect(within(row).getByText("pending")).toBeInTheDocument();
    expect(within(row).getByText("2 / 3")).toBeInTheDocument();
  });

  it("preserves backend row order and emits sort requests", async () => {
    const onSort = vi.fn();
    const rows = [
      makeRow({ id: "a", displayName: "Alpha" }),
      makeRow({ id: "b", displayName: "Beta" }),
    ];
    render(
      <TenantAdminTable rows={rows} sortBy="createdAt" sortDir="desc" onSort={onSort} />,
    );
    const rendered = Array.from(
      screen.getByTestId("tenant-admin-table").querySelectorAll("[data-tenant-id]"),
    ).map((el) => el.getAttribute("data-tenant-id"));
    expect(rendered).toEqual(["a", "b"]);

    await userEvent.click(screen.getByLabelText("Sort by onboardingProgress"));
    expect(onSort).toHaveBeenCalledWith("onboardingProgress");
  });

  it("shows an empty state when the backend page has no rows", () => {
    render(
      <TenantAdminTable rows={[]} sortBy="createdAt" sortDir="desc" onSort={() => {}} />,
    );
    expect(
      screen.getByText("No tenants match the current filters."),
    ).toBeInTheDocument();
  });
});
