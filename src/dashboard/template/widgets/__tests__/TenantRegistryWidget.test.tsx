/**
 * Phase 2 Gate 4 — Tenant Registry widget tests.
 * Unit (states, counts) + integration (registration, single request).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const statsMock = vi.fn();

vi.mock("@tanstack/react-start", () => ({
  useServerFn: () => statsMock,
}));

vi.mock("@/lib/tenants/tenants.functions", () => ({
  getTenantRegistryStats: () => undefined,
}));

import {
  TenantRegistryWidget,
  TENANT_REGISTRY_WIDGET_ID,
} from "../TenantRegistryWidget";
import { getDashboardWidget, getDashboardRegistry } from "@/dashboard/template/registry";

function renderWidget() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TenantRegistryWidget />
    </QueryClientProvider>,
  );
}

const SAMPLE = {
  total: 152,
  byLifecycle: { created: 3, active: 140, suspended: 5, archived: 4 },
  byProvisioning: { not_started: 0, in_progress: 4, provisioned: 146, failed: 2 },
};

beforeEach(() => {
  statsMock.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("TenantRegistryWidget — rendering", () => {
  it("renders the widget title and subtitle", async () => {
    statsMock.mockResolvedValue(SAMPLE);
    renderWidget();
    expect(await screen.findByText("Tenant Registry")).toBeInTheDocument();
    expect(screen.getByText("Platform-wide tenant overview")).toBeInTheDocument();
  });

  it("shows a loading state before data resolves", () => {
    statsMock.mockReturnValue(new Promise(() => {}));
    const { container } = renderWidget();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("displays the counts returned by the backend", async () => {
    statsMock.mockResolvedValue(SAMPLE);
    renderWidget();
    expect(await screen.findByLabelText("Total tenants: 152")).toBeInTheDocument();
    expect(screen.getByLabelText("Active: 140")).toBeInTheDocument();
    expect(screen.getByLabelText("Draft: 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Suspended: 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Archived: 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Provisioned: 146")).toBeInTheDocument();
    expect(screen.getByLabelText("Pending provisioning: 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Failed provisioning: 2")).toBeInTheDocument();
  });

  it("renders the empty state when there are no tenants", async () => {
    statsMock.mockResolvedValue({
      total: 0,
      byLifecycle: { created: 0, active: 0, suspended: 0, archived: 0 },
      byProvisioning: { not_started: 0, in_progress: 0, provisioned: 0, failed: 0 },
    });
    renderWidget();
    expect(
      await screen.findByText("No tenant statistics available."),
    ).toBeInTheDocument();
  });

  it("renders the error state with a retry control", async () => {
    statsMock.mockRejectedValue(new Error("boom"));
    renderWidget();
    expect(
      await screen.findByText("Unable to load tenant statistics."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("refetches when retry is pressed", async () => {
    statsMock.mockRejectedValueOnce(new Error("boom")).mockResolvedValue(SAMPLE);
    renderWidget();
    const retry = await screen.findByRole("button", { name: /retry/i });
    retry.click();
    expect(await screen.findByLabelText("Total tenants: 152")).toBeInTheDocument();
  });
});

describe("TenantRegistryWidget — dashboard integration", () => {
  it("is registered in the shared dashboard registry", () => {
    const entry = getDashboardWidget(TENANT_REGISTRY_WIDGET_ID);
    expect(entry).toBeDefined();
    expect(entry?.component).toBe(TenantRegistryWidget);
    expect(entry?.permission).toBe("platform.dashboard.view");
  });

  it("registers exactly one tenant registry widget", () => {
    const ids = Object.keys(getDashboardRegistry()).filter(
      (id) => id === TENANT_REGISTRY_WIDGET_ID,
    );
    expect(ids).toHaveLength(1);
  });

  it("issues a single statistics request per mount", async () => {
    statsMock.mockResolvedValue(SAMPLE);
    renderWidget();
    await screen.findByLabelText("Total tenants: 152");
    await waitFor(() => expect(statsMock).toHaveBeenCalledTimes(1));
  });
});
