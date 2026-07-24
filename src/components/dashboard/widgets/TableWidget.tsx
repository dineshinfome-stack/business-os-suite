import type { ReactNode } from "react";
import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface TableWidgetColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
}

export function TableWidget<T extends { id: string | number }>({
  title,
  columns,
  rows,
  emptyLabel = "No data.",
}: {
  title: string;
  columns: TableWidgetColumn<T>[];
  rows: T[];
  emptyLabel?: string;
}) {
  return (
    <WidgetCard title={title} contentClassName="pt-0">
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.align === "right" ? "text-right" : ""}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    className={c.align === "right" ? "text-right tabular-nums" : ""}
                  >
                    {c.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </WidgetCard>
  );
}
