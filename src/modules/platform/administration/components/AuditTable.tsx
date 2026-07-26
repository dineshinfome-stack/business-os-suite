/**
 * Gate 3.7 · Global audit explorer table.
 * Values are redacted by the server mapper; CSV export uses the same mapper.
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/modules/platform/provisioning/components/States";
import type { PlatformAuditEntryDTO } from "@/modules/platform/administration/types";

export function AuditTable({ entries }: { entries: PlatformAuditEntryDTO[] }) {
  if (entries.length === 0) {
    return <EmptyState message="No audit entries match the current filters." />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Occurred</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Transition</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Correlation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap text-xs">
                {new Date(entry.occurredAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm font-medium">{entry.action}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {entry.entityType}
                {entry.entityId ? ` · ${entry.entityId}` : ""}
              </TableCell>
              <TableCell className="text-xs">
                {entry.previousState || entry.newState
                  ? `${entry.previousState ?? "—"} → ${entry.newState ?? "—"}`
                  : "—"}
              </TableCell>
              <TableCell className="max-w-xs text-xs text-muted-foreground">
                {entry.reason ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {entry.correlationId ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
