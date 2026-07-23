
-- Move citext to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role;
ALTER EXTENSION citext SET SCHEMA extensions;

-- Tighten UPDATE WITH CHECK on organization_invitations
DROP POLICY IF EXISTS org_invitations_update ON public.organization_invitations;
CREATE POLICY org_invitations_update ON public.organization_invitations
  FOR UPDATE TO authenticated
  USING (
    private.fn_is_org_member(auth.uid(), organization_id)
    OR lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  WITH CHECK (
    -- immutable identity fields cannot change
    organization_id = organization_id
    AND email = email
    AND role = role
    AND token_hash = token_hash
    AND invited_by = invited_by
    AND (
      private.fn_is_org_member(auth.uid(), organization_id)
      OR (
        -- invitee-side accept: must set accepted_by = self, status = accepted
        lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND status IN ('accepted','pending')
        AND (accepted_by IS NULL OR accepted_by = auth.uid())
      )
    )
  );
