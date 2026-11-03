-- Run in Supabase SQL Editor. Do NOT place a service-role key in your frontend.
-- 1. Create a teacher using Supabase Authentication > Users.
-- 2. Copy that user's UUID into the INSERT at the bottom.

create table if not exists public.teacher_permissions (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.published_knowledge (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.teacher_permissions enable row level security;
alter table public.published_knowledge enable row level security;

-- Each authenticated teacher may read ONLY their own permission record.
create policy "Teacher can check own access"
  on public.teacher_permissions for select to authenticated
  using (user_id = (select auth.uid()));

-- Students may read public, teacher-approved content only.
create policy "Everyone can read published knowledge"
  on public.published_knowledge for select to anon, authenticated
  using (true);

-- Only allowlisted, authenticated teachers may publish.
create policy "Authorized teachers can insert published content"
  on public.published_knowledge for insert to authenticated
  with check (exists (
    select 1 from public.teacher_permissions
    where user_id = (select auth.uid())
  ) and updated_by = (select auth.uid()));

create policy "Authorized teachers can update published content"
  on public.published_knowledge for update to authenticated
  using (exists (
    select 1 from public.teacher_permissions
    where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.teacher_permissions
    where user_id = (select auth.uid())
  ) and updated_by = (select auth.uid()));

-- Replace the example with the teacher's actual UUID, then uncomment:
-- insert into public.teacher_permissions(user_id)
-- values ('00000000-0000-0000-0000-000000000000')
-- on conflict (user_id) do nothing;

-- Enable instant cross-device updates for published teaching content.
-- If realtime is unavailable, pupils still receive changes on their next page load.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'published_knowledge') then
    alter publication supabase_realtime add table public.published_knowledge;
  end if;
end $$;
