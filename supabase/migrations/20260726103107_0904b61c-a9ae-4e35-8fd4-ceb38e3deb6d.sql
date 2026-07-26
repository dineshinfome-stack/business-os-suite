-- Gate 3.8 · Pass 3.8.2 — exact grant matrix for the read-only onboarding pass.
-- The project's default privileges grant ALL to anon/authenticated; this pass
-- narrows both tables to SELECT-only for authenticated and no anon access.

REVOKE ALL ON public.tenant_onboarding FROM anon;
REVOKE ALL ON public.tenant_onboarding FROM authenticated;
REVOKE ALL ON public.tenant_onboarding_steps FROM anon;
REVOKE ALL ON public.tenant_onboarding_steps FROM authenticated;

GRANT SELECT ON public.tenant_onboarding TO authenticated;
GRANT SELECT ON public.tenant_onboarding_steps TO authenticated;

GRANT ALL ON public.tenant_onboarding TO service_role;
GRANT ALL ON public.tenant_onboarding_steps TO service_role;