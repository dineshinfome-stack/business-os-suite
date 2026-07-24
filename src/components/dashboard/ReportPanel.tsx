import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export interface ReportTotal {
  label: string;
  value: string;
}

export interface ReportRow {
  label: string;
  value: string;
}

interface ReportPanelProps {
  title: string;
  right?: ReactNode;
  totals: ReportTotal[];
  rowsHeader: [string, string];
  rows: ReportRow[];
  sample?: boolean;
}

export function ReportPanel({ title, right, totals, rowsHeader, rows, sample }: ReportPanelProps) {
  return (
    <section
      className="rounded-md border bg-card"
      style={{ borderColor: "var(--brand-border)", boxShadow: "var(--elevation-1)" }}
    >
      <header
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: "var(--brand-border)" }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {sample && <Badge variant="outline" className="text-[10px]">Sample</Badge>}
        </div>
        {right && <div className="text-xs uppercase tracking-wide text-muted-foreground">{right}</div>}
      </header>

      <div
        className="grid gap-6 px-5 py-6"
        style={{ gridTemplateColumns: `repeat(${totals.length}, minmax(0, 1fr))` }}
      >
        {totals.map((t) => (
          <div key={t.label} className="text-center">
            <div className="text-2xl font-semibold text-foreground">{t.value}</div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t.label}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5">
        <div
          className="flex items-center justify-between border-b py-2 text-xs text-muted-foreground"
          style={{ borderColor: "var(--brand-border)" }}
        >
          <span>{rowsHeader[0]}</span>
          <span>{rowsHeader[1]}</span>
        </div>
        {rows.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No record found.</div>
        ) : (
          <ul>
            {rows.map((r, i) => (
              <li
                key={r.label}
                className="flex items-center justify-between px-2 py-2.5 text-sm"
                style={{ background: i % 2 === 0 ? "var(--surface-2)" : "transparent" }}
              >
                <span className="text-foreground">{r.label}</span>
                <span className="text-muted-foreground">{r.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function EmptyPanel({ title, columns, sample }: { title: string; columns: [string, string]; sample?: boolean }) {
  return (
    <section
      className="rounded-md border bg-card"
      style={{ borderColor: "var(--brand-border)", boxShadow: "var(--elevation-1)" }}
    >
      <header
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: "var(--brand-border)" }}
      >
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {sample && <Badge variant="outline" className="text-[10px]">Sample</Badge>}
      </header>
      <div className="px-5 py-4">
        <div
          className="flex items-center justify-between border-b py-2 text-xs text-muted-foreground"
          style={{ borderColor: "var(--brand-border)" }}
        >
          <span>{columns[0]}</span>
          <span>{columns[1]}</span>
        </div>
        <div className="py-8 text-center text-sm text-muted-foreground">No record found.</div>
      </div>
    </section>
  );
}
