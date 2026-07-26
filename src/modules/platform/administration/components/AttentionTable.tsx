/**
 * Gate 3.7 · Attention queue table.
 * Server-assigned precedence drives ordering; the client never re-ranks.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/modules/platform/provisioning/components/States";
import type {
  PlatformAttentionItemDTO,
  PlatformSeverity,
} from "@/modules/platform/administration/types";

const SEVERITY_VARIANT: Record<
  PlatformSeverity,
  "default" | "secondary" | "destructive" | "outline"
> = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
  info: "outline",
};

export function AttentionTable({
  items,
  onAcknowledge,
  acknowledging,
}: {
  items: PlatformAttentionItemDTO[];
  onAcknowledge?: (item: PlatformAttentionItemDTO) => void;
  acknowledging?: string | null;
}) {
  if (items.length === 0) {
    return <EmptyState message="Nothing needs attention right now." />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Severity</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Owning module</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge variant={SEVERITY_VARIANT[item.severity]}>{item.severity}</Badge>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="font-medium">{item.summary}</p>
                <p className="text-xs text-muted-foreground">{item.explanation}</p>
              </TableCell>
              <TableCell className="text-sm">{item.tenantName ?? "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.source}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(item.lastUpdatedAt).toLocaleString()}
              </TableCell>
              <TableCell className="space-x-2 text-right whitespace-nowrap">
                <Button variant="ghost" size="sm" asChild>
                  {/* Destinations are server-composed absolute paths. */}
                  <Link to={item.destination as "/platform/provisioning"}>
                    {item.destinationLabel}
                  </Link>
                </Button>
                {item.status === "open" && onAcknowledge ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={acknowledging === item.id}
                    onClick={() => onAcknowledge(item)}
                  >
                    Acknowledge
                  </Button>
                ) : (
                  <Badge variant="outline">acknowledged</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
