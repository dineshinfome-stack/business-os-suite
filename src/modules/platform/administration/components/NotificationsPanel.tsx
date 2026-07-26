/**
 * Gate 3.7 · Notification operations (read-only registry + operator inbox).
 */
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlatformNotificationSummaryDTO } from "@/modules/platform/administration/types";

export function NotificationsPanel({
  data,
}: {
  data: PlatformNotificationSummaryDTO;
}) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Delivery tracking unavailable</AlertTitle>
        <AlertDescription>{data.limitation}</AlertDescription>
      </Alert>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Notification type registry ({data.types.length})
        </h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Default severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.types.map((type) => (
                <TableRow key={type.type}>
                  <TableCell className="text-sm font-medium">{type.label}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {type.category}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {type.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{type.defaultSeverity}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your recent notifications ({data.recent.length})
        </h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-sm">{row.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.severity}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{row.status}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
