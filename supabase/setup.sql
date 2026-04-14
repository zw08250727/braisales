create extension if not exists pgcrypto;

create table if not exists public.agent_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_key text not null check (agent_key in ('customer', 'market')),
  agent_name text not null,
  agent_url text not null,
  form_data jsonb not null default '{}'::jsonb,
  generated_prompt text not null,
  status text not null default 'opened',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists agent_intakes_user_id_created_at_idx
  on public.agent_intakes (user_id, created_at desc);

alter table public.agent_intakes enable row level security;

drop policy if exists "Users can view their own agent intakes" on public.agent_intakes;
create policy "Users can view their own agent intakes"
  on public.agent_intakes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own agent intakes" on public.agent_intakes;
create policy "Users can insert their own agent intakes"
  on public.agent_intakes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own agent intakes" on public.agent_intakes;
create policy "Users can update their own agent intakes"
  on public.agent_intakes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own agent intakes" on public.agent_intakes;
create policy "Users can delete their own agent intakes"
  on public.agent_intakes
  for delete
  to authenticated
  using (auth.uid() = user_id);
