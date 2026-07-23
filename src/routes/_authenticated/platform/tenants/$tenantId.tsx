import * as React from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Can } from "@/components/auth/Can";
import {
  getTenant,
  activateTenant,
  suspendTenant,
  archiveTenant,
} from "@/lib/tenants/tenants.functions";
import { canTransition, type TenantLifecycleState } from "@/lib/tenants/lifecycle";

export const Route = createFileRoute("/_authenticated/platform/tenants/$tenantId")({
  component: TenantDetailPage,
  head: () => ({
    meta: [
      { title: "Tenant — Platform Administration" },
      { name: "description", content: "Manage a tenant's lifecycle." },
    ],
  }),
});

function TenantDetailPage() {
  const { tenantId } = useParams({ from: "/_authenticated/platform/tenants/$tenantId" });
  const get = useServerFn(getTenant);
  const activate = useServerFn(activateTenant);
  const suspend = useServerFn(suspendTenant);
  const archive = useServerFn(archiveTenant);
  const qc = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["platform", "tenant", tenantId],
    queryFn: () => get({ data: { tenantId } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
    qc.invalidateQueries({ queryKey: ["platform", "tenant", tenantId] });
  };

  const activateMut = useMutation({
    mutationFn: () => activate({ data: { tenantId } }),
    onSuccess: (r) => {
      toast.success(r.already_active ? "Already active" : "Tenant activated");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const suspendMut = useMutation({
    mutationFn: () => suspend({ data: { tenantId } }),
    onSuccess: (r) => {
      toast.success(r.already_suspended ? "Already suspended" : "Tenant suspended");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const archiveMut = useMutation({
    mutationFn: () => archive({ data: { tenantId } }),
    onSuccess: (r) => {
      toast.success(r.already_archived ? "Already archived" : "Tenant archived");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!tenant) return <div className="p-6 text-sm">Not found.</div>;

  const state = tenant.lifecycle_state as TenantLifecycleState;

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link
          to="/platform/tenants"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Tenants
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {tenant.display_name}
          </h1>
          <Badge variant="outline" className="font-mono">
            {tenant.slug}
          </Badge>
          <Badge>{state}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <Field label="Region" value={tenant.region} />
          <Field label="Locale" value={tenant.default_locale} />
          <Field label="Timezone" value={tenant.timezone} />
          <Field label="Plan" value={tenant.plan_tier} />
          <Field
            label="Created"
            value={new Date(tenant.created_at).toLocaleString()}
          />
          {tenant.activated_at && (
            <Field
              label="Activated"
              value={new Date(tenant.activated_at).toLocaleString()}
            />
          )}
          {tenant.suspended_at && (
            <Field
              label="Suspended"
              value={new Date(tenant.suspended_at).toLocaleString()}
            />
          )}
          {tenant.archived_at && (
            <Field
              label="Archived"
              value={new Date(tenant.archived_at).toLocaleString()}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lifecycle actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Can permission="platform.tenant.activate">
            <Button
              onClick={() => activateMut.mutate()}
              disabled={
                !canTransition(state, "active") || activateMut.isPending
              }
            >
              Activate
            </Button>
          </Can>
          <Can permission="platform.tenant.suspend">
            <Button
              variant="secondary"
              onClick={() => suspendMut.mutate()}
              disabled={
                !canTransition(state, "suspended") || suspendMut.isPending
              }
            >
              Suspend
            </Button>
          </Can>
          <Can permission="platform.tenant.archive">
            <Button
              variant="destructive"
              onClick={() => archiveMut.mutate()}
              disabled={
                !canTransition(state, "archived") || archiveMut.isPending
              }
            >
              Archive
            </Button>
          </Can>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
