-- SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5E (append-only corrective migration)
-- 1. Evaluator volatility correction: the readiness envelope embeds the
--    lock-sensitive `no_concurrent_activation` check, so neither evaluator
--    may be declared STABLE.
-- 2. Strict JSON metadata typing: setting validation metadata is accepted
--    only when each key carries its exact JSON type. No string/numeric
--    coercions. Bounded reason tokens only; raw exception text is never
--    surfaced.
-- No earlier migration is edited; this migration supersedes 3.8.5D.

/* --------------------------- 1. evaluator volatility --------------------- */

ALTER FUNCTION private.fn_onboarding_evaluate_readiness_json(uuid, text)
  VOLATILE;

ALTER FUNCTION private.fn_onboarding_evaluate_readiness_present_json(uuid, text)
  VOLATILE;

/* ------------------ 2. strict-typed setting value validator -------------- */

CREATE OR REPLACE FUNCTION private.fn_setting_value_invalid_reason(
  _data_type text,
  _schema    jsonb,
  _value     jsonb
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  v_schema   jsonb := COALESCE(_schema, '{}'::jsonb);
  v_required boolean := false;
  v_min      numeric;
  v_max      numeric;
  v_regex    text;
  v_has_enum boolean := false;
  v_text     text;
  v_num      numeric;
  v_probe    boolean;
BEGIN
  /* -- metadata is validated FIRST and fails closed ---------------------- */

  IF jsonb_typeof(v_schema) <> 'object' THEN
    RETURN 'invalid_schema';
  END IF;

  IF _data_type IS NULL
     OR _data_type NOT IN ('string', 'enum', 'integer', 'decimal', 'boolean', 'json') THEN
    RETURN 'invalid_schema';
  END IF;

  -- `required` MUST be a JSON boolean. {"required":"true"} / {"required":1}
  -- are malformed metadata, not truthy values.
  IF v_schema ? 'required' AND jsonb_typeof(v_schema->'required') <> 'null' THEN
    IF jsonb_typeof(v_schema->'required') <> 'boolean' THEN
      RETURN 'invalid_schema';
    END IF;
    v_required := (v_schema->>'required')::boolean;
  END IF;

  -- `min` / `max` MUST be JSON numbers. {"min":"5"} is malformed metadata.
  IF v_schema ? 'min' AND jsonb_typeof(v_schema->'min') <> 'null' THEN
    IF jsonb_typeof(v_schema->'min') <> 'number' THEN
      RETURN 'invalid_schema';
    END IF;
    v_min := (v_schema->>'min')::numeric;
  END IF;

  IF v_schema ? 'max' AND jsonb_typeof(v_schema->'max') <> 'null' THEN
    IF jsonb_typeof(v_schema->'max') <> 'number' THEN
      RETURN 'invalid_schema';
    END IF;
    v_max := (v_schema->>'max')::numeric;
  END IF;

  IF v_min IS NOT NULL AND v_max IS NOT NULL AND v_min > v_max THEN
    RETURN 'invalid_schema';
  END IF;

  -- `enum` MUST be a non-empty JSON array of JSON strings.
  IF v_schema ? 'enum' AND jsonb_typeof(v_schema->'enum') <> 'null' THEN
    IF jsonb_typeof(v_schema->'enum') <> 'array'
       OR jsonb_array_length(v_schema->'enum') = 0
       OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(v_schema->'enum') e
             WHERE jsonb_typeof(e) <> 'string') THEN
      RETURN 'invalid_schema';
    END IF;
    v_has_enum := true;
  END IF;

  -- An enum data type without a usable option list is malformed metadata,
  -- independent of the submitted value.
  IF _data_type = 'enum' AND NOT v_has_enum THEN
    RETURN 'invalid_schema';
  END IF;

  -- `regex` MUST be a JSON string and MUST compile.
  IF v_schema ? 'regex' AND jsonb_typeof(v_schema->'regex') <> 'null' THEN
    IF jsonb_typeof(v_schema->'regex') <> 'string' THEN
      RETURN 'invalid_schema';
    END IF;
    v_regex := NULLIF(v_schema->>'regex', '');
    IF v_regex IS NOT NULL THEN
      BEGIN
        v_probe := ('' ~ v_regex);
      EXCEPTION WHEN others THEN
        -- Malformed or unsupported pattern. Never leak the raw exception.
        RETURN 'invalid_schema';
      END;
    END IF;
  END IF;

  /* -- value validation -------------------------------------------------- */

  IF _value IS NULL OR jsonb_typeof(_value) = 'null' THEN
    RETURN 'missing';
  END IF;

  IF _data_type IN ('string', 'enum') THEN
    IF jsonb_typeof(_value) <> 'string' THEN
      RETURN 'type_mismatch';
    END IF;
    v_text := _value #>> '{}';
    IF v_required AND length(btrim(v_text)) = 0 THEN
      RETURN 'missing';
    END IF;
    IF v_min IS NOT NULL AND length(v_text) < v_min THEN
      RETURN 'out_of_range';
    END IF;
    IF v_max IS NOT NULL AND length(v_text) > v_max THEN
      RETURN 'out_of_range';
    END IF;
    IF v_has_enum THEN
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(v_schema->'enum') e
         WHERE e = v_text
      ) THEN
        RETURN 'enum_violation';
      END IF;
    END IF;
    IF v_regex IS NOT NULL AND v_text !~ v_regex THEN
      RETURN 'regex_violation';
    END IF;
    RETURN NULL;
  END IF;

  IF _data_type IN ('integer', 'decimal') THEN
    IF jsonb_typeof(_value) <> 'number' THEN
      RETURN 'type_mismatch';
    END IF;
    v_num := (_value #>> '{}')::numeric;
    IF _data_type = 'integer' AND v_num <> trunc(v_num) THEN
      RETURN 'type_mismatch';
    END IF;
    IF v_min IS NOT NULL AND v_num < v_min THEN RETURN 'out_of_range'; END IF;
    IF v_max IS NOT NULL AND v_num > v_max THEN RETURN 'out_of_range'; END IF;
    RETURN NULL;
  END IF;

  IF _data_type = 'boolean' THEN
    IF jsonb_typeof(_value) <> 'boolean' THEN
      RETURN 'type_mismatch';
    END IF;
    RETURN NULL;
  END IF;

  -- json
  IF v_required AND jsonb_typeof(_value) NOT IN ('object', 'array') THEN
    RETURN 'type_mismatch';
  END IF;
  RETURN NULL;
END $$;

REVOKE ALL ON FUNCTION private.fn_setting_value_invalid_reason(text, jsonb, jsonb)
  FROM PUBLIC, anon;