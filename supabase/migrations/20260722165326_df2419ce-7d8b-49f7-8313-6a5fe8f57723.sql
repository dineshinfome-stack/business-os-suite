
-- Seed demo users with known passwords for the login page
DO $$
DECLARE
  admin_id uuid;
  member_id uuid;
BEGIN
  -- Admin demo user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@demo.test') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'admin@demo.test', crypt('DemoPass123!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'admin@demo.test'),
      'email', admin_id::text, now(), now(), now());
    INSERT INTO public.user_roles (user_id, role) VALUES (admin_id, 'admin')
      ON CONFLICT DO NOTHING;
  END IF;

  -- Member demo user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'member@demo.test') THEN
    member_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', member_id, 'authenticated', 'authenticated',
      'member@demo.test', crypt('DemoPass123!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Member"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), member_id,
      jsonb_build_object('sub', member_id::text, 'email', 'member@demo.test'),
      'email', member_id::text, now(), now(), now());
    INSERT INTO public.user_roles (user_id, role) VALUES (member_id, 'member')
      ON CONFLICT DO NOTHING;
  END IF;
END $$;
