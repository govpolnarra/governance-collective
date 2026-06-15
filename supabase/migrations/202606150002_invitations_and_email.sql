create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text default 'contributor' check (role in ('contributor', 'seeker', 'solution_provider', 'mentor', 'partner', 'curator')),
  status text default 'draft' check (status in ('draft', 'sent', 'accepted', 'failed', 'revoked')),
  note text,
  invited_by uuid references public.profiles(id),
  accepted_by uuid references public.profiles(id),
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invitations enable row level security;

drop policy if exists "curators read invitations" on public.invitations;
create policy "curators read invitations" on public.invitations
  for select using (public.current_profile_role() in ('curator', 'admin'));

drop policy if exists "curators create invitations" on public.invitations;
create policy "curators create invitations" on public.invitations
  for insert with check (auth.uid() = invited_by and public.current_profile_role() in ('curator', 'admin'));

drop policy if exists "curators update invitations" on public.invitations;
create policy "curators update invitations" on public.invitations
  for update using (public.current_profile_role() in ('curator', 'admin'))
  with check (public.current_profile_role() in ('curator', 'admin'));
