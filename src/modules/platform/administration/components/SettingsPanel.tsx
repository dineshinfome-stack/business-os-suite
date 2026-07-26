/**
 * Gate 3.7 · Platform settings + operational policy panels.
 *
 * Every row states its owner, source of truth and mutability. Non-editable
 * rows render as read-only with an explanatory reason.
 */
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  PlatformOperationalPolicyDTO,
  PlatformSettingDTO,
} from "@/modules/platform/administration/types";

function SettingEditor({
  setting,
  disabled,
  onSave,
}: {
  setting: PlatformSettingDTO;
  disabled: boolean;
  onSave: (value: string | number | boolean) => void;
}) {
  const [draft, setDraft] = React.useState(String(setting.value ?? ""));

  React.useEffect(() => {
    setDraft(String(setting.value ?? ""));
  }, [setting.value]);

  if (setting.mutability !== "editable") {
    return (
      <span className="text-sm text-muted-foreground">
        {String(setting.value ?? "—")}
      </span>
    );
  }

  if (setting.dataType === "boolean") {
    return (
      <Switch
        checked={Boolean(setting.value)}
        disabled={disabled}
        aria-label={`Toggle ${setting.label}`}
        onCheckedChange={(checked) => onSave(checked)}
      />
    );
  }

  if (setting.dataType === "enum" && setting.allowedValues) {
    return (
      <Select
        value={String(setting.value ?? "")}
        disabled={disabled}
        onValueChange={(value) => onSave(value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {setting.allowedValues.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        className="w-40"
        value={draft}
        disabled={disabled}
        inputMode={setting.dataType === "number" ? "numeric" : "text"}
        aria-label={setting.label}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || draft === String(setting.value ?? "")}
        onClick={() =>
          onSave(setting.dataType === "number" ? Number(draft) : draft)
        }
      >
        Save
      </Button>
    </div>
  );
}

export function SettingsTable({
  settings,
  canManage,
  saving,
  onSave,
}: {
  settings: PlatformSettingDTO[];
  canManage: boolean;
  saving: boolean;
  onSave: (key: string, value: string | number | boolean) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Setting</TableHead>
            <TableHead>Owning module</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Mutability</TableHead>
            <TableHead>Source of truth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {settings.map((setting) => (
            <TableRow key={setting.key}>
              <TableCell className="max-w-sm">
                <p className="font-medium">{setting.label}</p>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
                <p className="text-xs text-muted-foreground">{setting.key}</p>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {setting.owner}
              </TableCell>
              <TableCell>
                <SettingEditor
                  setting={setting}
                  disabled={!canManage || saving}
                  onSave={(value) => onSave(setting.key, value)}
                />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {String(setting.defaultValue ?? "—")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={setting.mutability === "editable" ? "secondary" : "outline"}
                >
                  {setting.mutability}
                </Badge>
                {setting.auditRequired ? (
                  <p className="mt-1 text-xs text-muted-foreground">audited</p>
                ) : null}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {setting.sourceOfTruth}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PolicyTable({
  policies,
}: {
  policies: PlatformOperationalPolicyDTO[];
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy</TableHead>
            <TableHead>Owning module</TableHead>
            <TableHead>Effective value</TableHead>
            <TableHead>Mutability</TableHead>
            <TableHead>Source of truth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy.key}>
              <TableCell className="max-w-sm">
                <p className="font-medium">{policy.label}</p>
                <p className="text-xs text-muted-foreground">{policy.description}</p>
                {policy.note ? (
                  <p className="text-xs text-muted-foreground">{policy.note}</p>
                ) : null}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {policy.owner}
              </TableCell>
              <TableCell className="text-sm">{policy.effectiveValue}</TableCell>
              <TableCell>
                <Badge variant="outline">{policy.mutability}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {policy.sourceOfTruth}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
