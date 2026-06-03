-- profiles: extends auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free',
  documents_this_month int not null default 0,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  input_data jsonb not null default '{}',
  generated_text text not null default '',
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);

-- subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- indexes
create index if not exists documents_user_id_idx on public.documents (user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.subscriptions enable row level security;

-- profiles
create policy "profiles: owner read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: service role all"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- documents
create policy "documents: owner read"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "documents: owner insert"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "documents: owner update"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "documents: owner delete"
  on public.documents for delete
  using (auth.uid() = user_id);

create policy "documents: service role all"
  on public.documents for all
  using (auth.role() = 'service_role');

-- subscriptions
create policy "subscriptions: owner read"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions: service role all"
  on public.subscriptions for all
  using (auth.role() = 'service_role');
