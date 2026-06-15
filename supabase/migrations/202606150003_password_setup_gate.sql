alter table if exists public.profiles
  add column if not exists password_set boolean default false;

create or replace function public.current_profile_password_set()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(password_set, false) from public.profiles where id = auth.uid()
$$;
