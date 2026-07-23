import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/notify";
import {
  useDeleteSetting,
  useRevealSensitiveSetting,
  useSetSetting,
} from "@/hooks/settings/useSettings";
import type {
  ResolvedSetting,
  SettingDefinition,
} from "@/lib/settings.functions";
import { REDACTED_VALUE } from "@/lib/settings-validation";

type Scope = "platform" | "organization";

export function SettingField({
  definition,
  resolved,
  scope,
}: {
  definition: SettingDefinition;
  resolved: ResolvedSetting | undefined;
  scope: Scope;
}) {
  const setMut = useSetSetting();
  const delMut = useDeleteSetting();
  const revealMut = useRevealSensitiveSetting();

  const initial = useMemo(() => {
    if (definition.dataType === "boolean") {
      return Boolean(resolved?.value ?? false);
    }
    if (resolved?.value === REDACTED_VALUE) return "";
    return resolved?.value == null ? "" : String(resolved.value);
  }, [definition.dataType, resolved]);

  const [draft, setDraft] = useState<string | boolean>(initial);

  const disabled = definition.isSystem;

  function save() {
    let value: unknown = draft;
    if (definition.dataType === "integer" || definition.dataType === "decimal") {
      const n = Number(draft);
      if (Number.isNaN(n)) return notify.error("Value must be a number");
      value = n;
    }
    setMut.mutate(
      { key: definition.key, scope, value: value as never },
      {
        onSuccess: () => notify.success(`${definition.key} saved`),
        onError: (err) =>
          notify.error(err instanceof Error ? err.message : "Save failed"),
      },
    );
  }

  function clearOverride() {
    delMut.mutate(
      { key: definition.key, scope },
      {
        onSuccess: () => notify.success("Override cleared"),
        onError: (err) =>
          notify.error(err instanceof Error ? err.message : "Clear failed"),
      },
    );
  }

  function reveal() {
    revealMut.mutate(
      { key: definition.key, scope },
      {
        onSuccess: (r) => {
          const shown = r.value == null ? "(empty)" : String(r.value);
          setDraft(shown);
          notify.success("Revealed — this action was audited");
        },
        onError: () => notify.error("You do not have permission to reveal this value"),
      },
    );
  }

  return (
    <div className="grid gap-2 rounded-lg border border-border p-4 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Label className="font-medium">{definition.key}</Label>
          {definition.isSystem ? (
            <Badge variant="secondary" className="text-xs">Framework-owned</Badge>
          ) : null}
          {definition.isSensitive ? (
            <Badge variant="destructive" className="text-xs">Sensitive</Badge>
          ) : null}
          {resolved ? (
            <Badge variant="outline" className="text-xs">source: {resolved.source}</Badge>
          ) : null}
        </div>
        {definition.description ? (
          <p className="text-sm text-muted-foreground">{definition.description}</p>
        ) : null}
        <div className="pt-2">
          {definition.dataType === "boolean" ? (
            <Switch
              checked={Boolean(draft)}
              onCheckedChange={(v) => setDraft(v)}
              disabled={disabled}
            />
          ) : (
            <Input
              value={typeof draft === "boolean" ? "" : draft}
              onChange={(e) => setDraft(e.target.value)}
              type={definition.dataType === "integer" || definition.dataType === "decimal" ? "number" : "text"}
              disabled={disabled}
              placeholder={definition.isSensitive && resolved?.value === REDACTED_VALUE ? REDACTED_VALUE : ""}
            />
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        <Button size="sm" onClick={save} disabled={disabled || setMut.isPending}>
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={clearOverride}
          disabled={disabled || delMut.isPending || resolved?.source === "default"}
        >
          Clear
        </Button>
        {definition.isSensitive ? (
          <Button size="sm" variant="outline" onClick={reveal} disabled={revealMut.isPending}>
            Reveal
          </Button>
        ) : null}
      </div>
    </div>
  );
}
