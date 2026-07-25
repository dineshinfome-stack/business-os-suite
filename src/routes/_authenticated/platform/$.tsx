import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PLATFORM_NAV } from "@/components/platform/nav-items";

export const Route = createFileRoute("/_authenticated/platform/$")({
  component: ComingSoonPage,
  head: () => ({
    meta: [
      { title: "Coming soon — Platform Admin" },
      { name: "description", content: "This Platform Admin area is not yet available." },
    ],
  }),
});

function ComingSoonPage() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const match = PLATFORM_NAV.find((n) => pathname.startsWith(n.to));
  const label = match?.label ?? "Section";

  return (
    <div className="mx-auto max-w-xl rounded-md border bg-card p-10 text-center" style={{ borderColor: "var(--brand-border)" }}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--surface-2)" }}>
        <Construction className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{label} — Coming soon</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This Platform Admin surface is planned. The navigation entry is reserved so the shell layout stays consistent.
      </p>
    </div>
  );
}
