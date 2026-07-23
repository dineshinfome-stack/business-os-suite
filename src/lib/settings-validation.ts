/**
 * Sprint 0.6 — Settings validation.
 *
 * Builds a runtime Zod schema from a definition's `data_type` and the
 * declarative `validation_schema` JSON stored in `setting_definitions`.
 * Keeps the on-the-wire schema tiny (JSON) while allowing rich validation.
 */
import { z, type ZodTypeAny } from "zod";

export type SettingDataType =
  | "string"
  | "integer"
  | "decimal"
  | "boolean"
  | "enum"
  | "json";

export type ValidationSchema = {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: string;
  enum?: string[];
};

function stringSchema(v: ValidationSchema): ZodTypeAny {
  let s = z.string();
  if (v.min != null) s = s.min(v.min);
  if (v.max != null) s = s.max(v.max);
  if (v.regex) s = s.regex(new RegExp(v.regex));
  if (!v.required) return s.or(z.literal(""));
  return s.min(1);
}

function numberSchema(v: ValidationSchema, integer: boolean): ZodTypeAny {
  let n = z.number();
  if (integer) n = n.int();
  if (v.min != null) n = n.min(v.min);
  if (v.max != null) n = n.max(v.max);
  return n;
}

export function buildValidator(
  dataType: SettingDataType,
  validation: ValidationSchema | Record<string, unknown> | null | undefined,
): ZodTypeAny {
  const v = (validation ?? {}) as ValidationSchema;
  switch (dataType) {
    case "string":
      return stringSchema(v);
    case "integer":
      return numberSchema(v, true);
    case "decimal":
      return numberSchema(v, false);
    case "boolean":
      return z.boolean();
    case "enum": {
      const values = v.enum ?? [];
      if (values.length === 0) return z.string();
      return z.enum(values as [string, ...string[]]);
    }
    case "json":
      return z.unknown();
    default:
      return z.unknown();
  }
}

export function validateSettingValue(
  dataType: SettingDataType,
  validation: ValidationSchema | Record<string, unknown> | null | undefined,
  value: unknown,
) {
  return buildValidator(dataType, validation).parse(value);
}

export const REDACTED_VALUE = "***REDACTED***" as const;

export function isSensitiveRedactable(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}
