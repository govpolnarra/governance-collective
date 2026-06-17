alter table if exists public.action_labs
  add column if not exists review_owner_id uuid references public.profiles(id),
  add column if not exists review_notes text;

alter table if exists public.learning_logs
  add column if not exists decision_notes text,
  add column if not exists review_notes text,
  add column if not exists converted_to_type text,
  add column if not exists converted_to_id uuid;

alter table if exists public.solution_pathways
  add column if not exists root_cause text,
  add column if not exists actors text,
  add column if not exists possible_solutions text,
  add column if not exists adoption_conditions text,
  add column if not exists curator_note text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  title text not null,
  body text,
  href text,
  metadata jsonb default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications
  for select using (auth.uid() = recipient_id);

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
  for update using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

drop policy if exists "system creates notifications" on public.notifications;
create policy "system creates notifications" on public.notifications
  for insert with check (
    auth.uid() = actor_id
    or public.current_profile_role() in ('curator', 'admin')
  );

create index if not exists notifications_recipient_created_idx
  on public.notifications(recipient_id, created_at desc);

drop policy if exists "creators update draft solution pathways" on public.solution_pathways;
create policy "creators update draft solution pathways" on public.solution_pathways
  for update using (
    auth.uid() = created_by
    and status in ('draft', 'revision_requested')
    and public.current_profile_access_tier() in ('trusted', 'internal')
  )
  with check (
    auth.uid() = created_by
    and public.current_profile_access_tier() in ('trusted', 'internal')
  );

create or replace function public.notify_curators_on_queue_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications(recipient_id, actor_id, event_type, title, body, href, metadata)
  select
    p.id,
    new.submitted_by,
    'curation_submitted',
    'New item needs review',
    initcap(replace(new.content_type, '_', ' ')) || ' submitted for curator review.',
    '/curation',
    jsonb_build_object('queue_id', new.id, 'content_id', new.content_id, 'content_type', new.content_type)
  from public.profiles p
  where p.role::text in ('curator', 'admin')
    and p.is_approved is true;

  insert into public.curation_events(queue_id, content_id, content_type, action, notes, actor_id)
  values (new.id, new.content_id, new.content_type, 'submitted', null, new.submitted_by);

  return new;
end;
$$;

drop trigger if exists curation_queue_notify_curators on public.curation_queue;
create trigger curation_queue_notify_curators
after insert on public.curation_queue
for each row execute function public.notify_curators_on_queue_insert();

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
  elsif p_content_type = 'solution_pathway' then
    update public.solution_pathways
    set status = case when p_status = 'published' then 'active' when p_status = 'rejected' then 'archived' else 'under_review' end,
        curator_note = p_notes,
        updated_at = now()
    where id = p_content_id;
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
  event_action text;
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
    event_action := 'approved';
  elsif p_action = 'reject' then
    next_queue_status := 'rejected';
    next_content_status := 'rejected';
    event_action := 'rejected';
  elsif p_action = 'revision_requested' then
    next_queue_status := 'revision_requested';
    next_content_status := 'revision_requested';
    event_action := 'revision_requested';
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
  values (p_queue_id, item.content_id, item.content_type, event_action, p_notes, auth.uid());

  insert into public.notifications(recipient_id, actor_id, event_type, title, body, href, metadata)
  values (
    item.submitted_by,
    auth.uid(),
    event_action,
    case
      when event_action = 'approved' then 'Your submission was approved'
      when event_action = 'revision_requested' then 'Revision requested'
      else 'Your submission was reviewed'
    end,
    coalesce(p_notes, initcap(replace(item.content_type, '_', ' ')) || ' review completed.'),
    case
      when item.content_type = 'playbook' then '/playbooks/' || item.content_id::text
      when item.content_type = 'solution' then '/solutions/' || item.content_id::text
      when item.content_type = 'learning_resource' then '/learning/' || item.content_id::text
      when item.content_type = 'request' then '/requests/' || item.content_id::text
      when item.content_type = 'solution_pathway' then '/solution-studio/' || item.content_id::text
      else '/my-submissions'
    end,
    jsonb_build_object('queue_id', item.id, 'content_id', item.content_id, 'content_type', item.content_type)
  );
end;
$$;

create or replace function public.create_action_lab_review_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
begin
  if public.current_profile_role() not in ('curator', 'admin') then
    raise exception 'Only curators and admins can create review reminders';
  end if;

  with recipients as (
    select
      al.id as lab_id,
      al.title,
      al.next_review_date,
      unnest(array_remove(array[al.review_owner_id, al.solution_anchor_id, al.created_by], null)) as recipient_id
    from public.action_labs al
    where al.status in ('active', 'blocked', 'paused')
      and al.next_review_date is not null
      and al.next_review_date <= current_date + interval '7 days'
  ),
  inserted as (
    insert into public.notifications(recipient_id, actor_id, event_type, title, body, href, metadata)
    select distinct
      r.recipient_id,
      auth.uid(),
      'action_lab_review_due',
      'Action Lab review is due',
      r.title || ' has a review due on ' || r.next_review_date::text || '.',
      '/action-labs/' || r.lab_id::text,
      jsonb_build_object('action_lab_id', r.lab_id, 'next_review_date', r.next_review_date)
    from recipients r
    where r.recipient_id is not null
      and not exists (
        select 1 from public.notifications n
        where n.recipient_id = r.recipient_id
          and n.event_type = 'action_lab_review_due'
          and n.metadata->>'action_lab_id' = r.lab_id::text
          and n.created_at > now() - interval '7 days'
      )
    returning 1
  )
  select count(*) into inserted_count from inserted;

  return inserted_count;
end;
$$;

grant execute on function public.create_action_lab_review_reminders() to authenticated;
