
REVOKE ALL ON FUNCTION private.fn_bootstrap_platform_owner(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.fn_block_system_row_mutation() FROM PUBLIC;
-- Explicit: only service_role and postgres owner may invoke bootstrap
GRANT EXECUTE ON FUNCTION private.fn_bootstrap_platform_owner(text) TO service_role;
