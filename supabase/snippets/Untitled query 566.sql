begin;

do $$
declare
  v_user_id uuid;
  v_now timestamptz := now();
begin
  select id
  into v_user_id
  from auth.users
  where email = 'test@aisistent.rs';

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      is_super_admin,
      is_sso_user,
      is_anonymous
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'test@aisistent.rs',
      crypt('demo1234', gen_salt('bf')),
      v_now,
      v_now,
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      v_now,
      v_now,
      '',
      '',
      '',
      '',
      false,
      false,
      false
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', 'test@aisistent.rs',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      v_user_id::text,
      v_now,
      v_now,
      v_now
    );
  else
    update auth.users
    set
      encrypted_password = crypt('demo1234', gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, v_now),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      updated_at = v_now
    where id = v_user_id;

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    select
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', 'test@aisistent.rs',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      v_user_id::text,
      v_now,
      v_now,
      v_now
    where not exists (
      select 1
      from auth.identities
      where user_id = v_user_id
        and provider = 'email'
    );
  end if;

  insert into public.profiles (id, plan, documents_this_month)
  values (v_user_id, 'pro', 0)
  on conflict (id) do update
    set plan = 'pro',
        documents_this_month = 0;

  update public.subscriptions
  set
    plan = 'pro',
    status = 'active',
    current_period_end = v_now + interval '1 year'
  where user_id = v_user_id;

  if not found then
    insert into public.subscriptions (
      user_id,
      stripe_subscription_id,
      plan,
      status,
      current_period_end
    )
    values (
      v_user_id,
      null,
      'pro',
      'active',
      v_now + interval '1 year'
    );
  end if;
end
$$;

commit;