/**
 * Gate 3.7 · Platform feature controls (platform-scope rows only).
 */
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlatformFeatureControlDTO } from "@/modules/platform/administration/types";

export function FeatureControlsTable({
  features,
  canManage,
  saving,
  onToggle,
}: {
  features: PlatformFeatureControlDTO[];
  canManage: boolean;
  saving: boolean;
  onToggle: (key: string, enabled: boolean) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Rollout stage</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Last changed</TableHead>
            <TableHead className="text-right">Enabled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature.key}>
              <TableCell className="max-w-sm">
                <p className="font-medium">{feature.displayName}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
                <p className="text-xs text-muted-foreground">{feature.key}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{feature.rolloutStage}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {feature.source}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {feature.lastChangedAt
                  ? new Date(feature.lastChangedAt).toLocaleString()
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={feature.enabled}
                  aria-label={`Toggle ${feature.displayName}`}
                  disabled={!canManage || saving || feature.mutability !== "editable"}
                  onCheckedChange={(checked) => onToggle(feature.key, checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
