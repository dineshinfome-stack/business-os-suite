
-- SPR-MOD-001-002 Migration 003: Organization Structure permissions
-- 17 keys: company (6) + branch (5) + financial_year (6)

INSERT INTO public.permissions(key, module, resource, action, name, description, system_permission)
VALUES
  ('platform.company.read',           'platform','company','read',          'Read companies',        'View companies in Platform Admin', true),
  ('platform.company.create',         'platform','company','create',        'Create company',        'Create a new company under a tenant', true),
  ('platform.company.activate',       'platform','company','activate',      'Activate company',      'Transition a company to active', true),
  ('platform.company.deactivate',     'platform','company','deactivate',    'Deactivate company',    'Transition a company to inactive', true),
  ('platform.company.archive',        'platform','company','archive',       'Archive company',       'Archive a company', true),
  ('platform.company.set_default',    'platform','company','set_default',   'Set default company',   'Mark a company as the tenant default', true),
  ('platform.branch.read',            'platform','branch','read',           'Read branches',         'View branches in Platform Admin', true),
  ('platform.branch.create',          'platform','branch','create',         'Create branch',         'Create a branch under an active company', true),
  ('platform.branch.update',          'platform','branch','update',         'Update branch',         'Update mutable branch fields', true),
  ('platform.branch.archive',         'platform','branch','archive',        'Archive branch',        'Archive a branch', true),
  ('platform.branch.set_default',     'platform','branch','set_default',    'Set default branch',    'Mark a branch as the company default', true),
  ('platform.financial_year.read',       'platform','financial_year','read',       'Read financial years',    'View financial years in Platform Admin', true),
  ('platform.financial_year.create',     'platform','financial_year','create',     'Create financial year',   'Create a financial year for a company', true),
  ('platform.financial_year.open',       'platform','financial_year','open',       'Open financial year',     'Transition a financial year to open', true),
  ('platform.financial_year.close',      'platform','financial_year','close',      'Close financial year',    'Close an open financial year', true),
  ('platform.financial_year.archive',    'platform','financial_year','archive',    'Archive financial year',  'Archive a closed financial year', true),
  ('platform.financial_year.set_default','platform','financial_year','set_default','Set default financial year','Mark a financial year as the company default', true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN (
  'platform.company.read','platform.company.create','platform.company.activate',
  'platform.company.deactivate','platform.company.archive','platform.company.set_default',
  'platform.branch.read','platform.branch.create','platform.branch.update',
  'platform.branch.archive','platform.branch.set_default',
  'platform.financial_year.read','platform.financial_year.create','platform.financial_year.open',
  'platform.financial_year.close','platform.financial_year.archive','platform.financial_year.set_default'
)
WHERE r.key IN ('platform_admin','platform_owner')
ON CONFLICT DO NOTHING;
