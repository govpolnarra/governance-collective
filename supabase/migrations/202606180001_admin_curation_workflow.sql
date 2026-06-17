create table if not exists public.curation_events (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid references public.curation_queue(id) on delete set null,
  content_id uuid not null,
  content_type text not null,
  action text not null check (action in ('submitted', 'assigned', 'approved', 'rejected', 'revision_requested', 'note')),
  notes text,
  actor_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table if exists public.curation_queue
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists review_notes text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.curation_queue enable row level security;
alter table public.curation_events enable row level security;

drop policy if exists "curators read curation events" on public.curation_events;
create policy "curators read curation events" on public.curation_events
  for select using (public.current_profile_role() in ('curator', 'admin'));

drop policy if exists "curators create curation events" on public.curation_events;
create policy "curators create curation events" on public.curation_events
  for insert with check (auth.uid() = actor_id and public.current_profile_role() in ('curator', 'admin'));

drop policy if exists "curators read curation queue" on public.curation_queue;
create policy "curators read curation queue" on public.curation_queue
  for select using (public.current_profile_role() in ('curator', 'admin'));

drop policy if exists "curators update curation queue" on public.curation_queue;
create policy "curators update curation queue" on public.curation_queue
  for update using (public.current_profile_role() in ('curator', 'admin'))
  with check (public.current_profile_role() in ('curator', 'admin'));

drop policy if exists "contributors create curation queue items" on public.curation_queue;
create policy "contributors create curation queue items" on public.curation_queue
  for insert with check (auth.uid() = submitted_by);

create or replace function public.set_content_review_status(
  p_content_type text,
  p_content_id uuid,
  p_status text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_profile_role() not in ('curator', 'admin') then
    raise exception 'Only curators and admins can review content';
  end if;

  if p_content_type = 'playbook' then
    update public.playbooks set status = p_status, curator_note = p_notes, updated_at = now() where id = p_content_id;
  elsif p_content_type = 'solution' then
    update public.solutions set status = p_status, curator_note = p_notes, updated_at = now() where id = p_content_id;
  elsif p_content_type = 'learning_resource' then
    update public.learning_resources set status = p_status, updated_at = now() where id = p_content_id;
  elsif p_content_type = 'request' then
    update public.requests
    set status = case when p_status = 'published' then 'open' when p_status = 'rejected' then 'closed' else status end,
        updated_at = now()
    where id = p_content_id;
  else
    raise exception 'Unsupported content type: %', p_content_type;
  end if;
end;
$$;

create or replace function public.review_content(
  p_queue_id uuid,
  p_action text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  next_queue_status text;
  next_content_status text;
begin
  if public.current_profile_role() not in ('curator', 'admin') then
    raise exception 'Only curators and admins can review content';
  end if;

  select * into item from public.curation_queue where id = p_queue_id;
  if not found then
    raise exception 'Curation queue item not found';
  end if;

  if p_action = 'approve' then
    next_queue_status := 'published';
    next_content_status := 'published';
  elsif p_action = 'reject' then
    next_queue_status := 'rejected';
    next_content_status := 'rejected';
  elsif p_action = 'revision_requested' then
    next_queue_status := 'revision_requested';
    next_content_status := 'revision_requested';
  else
    raise exception 'Unsupported review action: %', p_action;
  end if;

  perform public.set_content_review_status(item.content_type, item.content_id, next_content_status, p_notes);

  update public.curation_queue
  set status = next_queue_status,
      reviewed_by = auth.uid(),
      review_notes = p_notes,
      reviewed_at = now(),
      updated_at = now()
  where id = p_queue_id;

  insert into public.curation_events(queue_id, content_id, content_type, action, notes, actor_id)
  values (p_queue_id, item.content_id, item.content_type, next_queue_status, p_notes, auth.uid());
end;
$$;

create or replace function public.approve_content(p_queue_id uuid, p_notes text default null)
returns void
language sql
security definer
set search_path = public
as $$
  select public.review_content(p_queue_id, 'approve', p_notes);
$$;

create or replace function public.reject_content(p_queue_id uuid, p_notes text default null)
returns void
language sql
security definer
set search_path = public
as $$
  select public.review_content(p_queue_id, 'reject', p_notes);
$$;

create or replace function public.request_content_revision(p_queue_id uuid, p_notes text default null)
returns void
language sql
security definer
set search_path = public
as $$
  select public.review_content(p_queue_id, 'revision_requested', p_notes);
$$;

grant execute on function public.review_content(uuid, text, text) to authenticated;
grant execute on function public.approve_content(uuid, text) to authenticated;
grant execute on function public.reject_content(uuid, text) to authenticated;
grant execute on function public.request_content_revision(uuid, text) to authenticated;
