create extension if not exists "pgcrypto";

do $$ begin
  create type public.gc_role as enum ('member', 'contributor', 'seeker', 'solution_provider', 'mentor', 'partner', 'curator', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gc_access_tier as enum ('registered', 'trusted', 'internal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gc_visibility as enum ('public', 'registered', 'trusted', 'internal');
exception when duplicate_object then null; end $$;

alter table if exists public.profiles
  add column if not exists access_tier public.gc_access_tier default 'registered',
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists geographies text[],
  add column if not exists sectors text[],
  add column if not exists methods text[],
  add column if not exists availability text check (availability in ('open', 'on_request', 'not_available')),
  add column if not exists recognition_level text;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function public.current_profile_access_tier()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(access_tier::text, case when role::text in ('curator', 'admin') then 'internal' else 'registered' end)
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.current_profile_is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(is_approved, false) from public.profiles where id = auth.uid()
$$;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_type text check (org_type in ('ngo', 'social_enterprise', 'for_profit', 'government', 'academic', 'csr', 'foundation', 'collective', 'other')),
  description text,
  website_url text,
  contact_email text,
  sectors text[],
  geographies text[],
  verification_status text default 'unverified' check (verification_status in ('unverified', 'submitted', 'verified', 'rejected')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  district_name text not null,
  district_type text default 'district' check (district_type in ('district', 'urban_municipal_corporation', 'division', 'department')),
  summary text,
  priority_themes text[],
  active_problem_count int default 0,
  canvas_visibility public.gc_visibility default 'trusted',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.district_canvas_entries (
  id uuid primary key default gen_random_uuid(),
  district_id uuid references public.districts(id) on delete cascade,
  entry_type text check (entry_type in ('priority', 'active_problem', 'decision', 'actor', 'handover_note', 'bottleneck', 'opportunity', 'context_note')),
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'closed', 'deferred', 'watch')),
  visibility public.gc_visibility default 'trusted',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.action_labs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  district_id uuid references public.districts(id),
  state_priority_theme text,
  district_specific_track boolean default false,
  problem_statement text,
  root_cause_summary text,
  primary_indicator text,
  secondary_indicators text[],
  stage text default 'diagnose' check (stage in ('diagnose', 'design', 'embed', 'measure', 'replicate', 'closed')),
  status text default 'active' check (status in ('active', 'blocked', 'paused', 'completed')),
  lead_fellow_ids uuid[],
  solution_anchor_id uuid references public.profiles(id),
  government_counterpart text,
  visibility public.gc_visibility default 'trusted',
  start_date date,
  next_review_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.learning_logs (
  id uuid primary key default gen_random_uuid(),
  action_lab_id uuid references public.action_labs(id) on delete cascade,
  log_type text check (log_type in ('daily_capture', 'weekly_log', 'monthly_synthesis', 'quarterly_review_note')),
  date date,
  location text,
  what_was_tried text,
  what_was_observed text,
  what_was_learned text,
  what_changes_next text,
  blockers text,
  support_needed text,
  visibility public.gc_visibility default 'internal',
  submitted_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.playbooks
  add column if not exists root_cause_chain text,
  add column if not exists intervention_design text,
  add column if not exists what_happened text,
  add column if not exists what_failed_or_surprised text,
  add column if not exists enabling_conditions text,
  add column if not exists actor_map text,
  add column if not exists relational_layer text,
  add column if not exists timeline_and_cost text,
  add column if not exists replication_readiness text check (replication_readiness in ('red', 'amber', 'green')),
  add column if not exists evidence_label text check (evidence_label in ('field_note', 'pilot', 'replicated', 'systemic')),
  add column if not exists district text,
  add column if not exists visibility public.gc_visibility default 'registered',
  add column if not exists curator_note text;

alter table if exists public.solutions
  add column if not exists organisation_id uuid references public.organisations(id),
  add column if not exists model_type text check (model_type in ('not_for_profit', 'for_profit', 'hybrid', 'government', 'other')),
  add column if not exists evidence_level text check (evidence_level in ('idea', 'pilot', 'proof_of_concept', 'validated', 'scaled')),
  add column if not exists geographies_of_validation text[],
  add column if not exists government_interface text check (government_interface in ('through_government', 'alongside_government', 'around_government', 'direct_to_community', 'mixed')),
  add column if not exists adoption_conditions text,
  add column if not exists implementation_cost_range text,
  add column if not exists risks_and_constraints text,
  add column if not exists contact_path text,
  add column if not exists visibility public.gc_visibility default 'registered',
  add column if not exists curator_note text;

create table if not exists public.solution_endorsements (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid references public.solutions(id) on delete cascade,
  endorser_id uuid references public.profiles(id),
  endorser_name text,
  endorser_organisation text,
  relationship_to_solution text,
  endorsement_text text,
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.requests
  add column if not exists need_type text check (need_type in ('solution', 'advice', 'practitioner_intro', 'co_design_partner', 'data_help', 'mentor_support')),
  add column if not exists problem_context text,
  add column if not exists state text,
  add column if not exists district text,
  add column if not exists timeline text,
  add column if not exists tags text[],
  add column if not exists visibility public.gc_visibility default 'registered',
  add column if not exists contact_path text;

create table if not exists public.request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests(id) on delete cascade,
  responder_id uuid references public.profiles(id),
  response_type text check (response_type in ('advice', 'solution_match', 'intro_offer', 'resource', 'mentor_offer')),
  response_text text,
  linked_content_type text,
  linked_content_id uuid,
  status text default 'submitted' check (status in ('submitted', 'accepted', 'not_relevant', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id),
  title text not null,
  summary text,
  body text,
  state text,
  district text,
  sector text,
  tags text[],
  visibility public.gc_visibility default 'registered',
  status text default 'draft',
  curator_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.learning_resources
  add column if not exists audience text check (audience in ('inside_government', 'outside_government', 'both')),
  add column if not exists duration_minutes int,
  add column if not exists body text,
  add column if not exists derived_from_type text,
  add column if not exists derived_from_id uuid,
  add column if not exists visibility public.gc_visibility default 'registered';

create table if not exists public.solution_pathways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  problem_statement text,
  district_id uuid references public.districts(id),
  action_lab_id uuid references public.action_labs(id),
  architecture_summary text,
  government_levers text[],
  solution_ids uuid[],
  expert_ids uuid[],
  actor_changes text,
  sequence text,
  measurement_plan text,
  risks text,
  status text default 'draft' check (status in ('draft', 'under_review', 'active', 'archived')),
  visibility public.gc_visibility default 'trusted',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.curation_queue
  add column if not exists assigned_to uuid references public.profiles(id),
  add column if not exists quality_flags text[],
  add column if not exists checklist jsonb;

create or replace function public.can_read_visibility(item_visibility public.gc_visibility)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when item_visibility = 'public' then true
    when auth.uid() is null then false
    when public.current_profile_role() in ('curator', 'admin') then true
    when public.current_profile_is_approved() is not true then false
    when item_visibility = 'registered' then true
    when item_visibility = 'trusted' then public.current_profile_access_tier() in ('trusted', 'internal')
    when item_visibility = 'internal' then public.current_profile_access_tier() = 'internal'
    else false
  end
$$;

alter table public.organisations enable row level security;
alter table public.districts enable row level security;
alter table public.district_canvas_entries enable row level security;
alter table public.action_labs enable row level security;
alter table public.learning_logs enable row level security;
alter table public.solution_endorsements enable row level security;
alter table public.request_responses enable row level security;
alter table public.case_notes enable row level security;
alter table public.solution_pathways enable row level security;

drop policy if exists "read organisations" on public.organisations;
create policy "read organisations" on public.organisations for select using (auth.uid() is not null and public.current_profile_is_approved());

drop policy if exists "read districts by visibility" on public.districts;
create policy "read districts by visibility" on public.districts for select using (public.can_read_visibility(canvas_visibility));

drop policy if exists "read district canvas by visibility" on public.district_canvas_entries;
create policy "read district canvas by visibility" on public.district_canvas_entries for select using (public.can_read_visibility(visibility));

drop policy if exists "read action labs by visibility" on public.action_labs;
create policy "read action labs by visibility" on public.action_labs for select using (public.can_read_visibility(visibility));

drop policy if exists "read learning logs by visibility" on public.learning_logs;
create policy "read learning logs by visibility" on public.learning_logs for select using (public.can_read_visibility(visibility));

drop policy if exists "read solution endorsements" on public.solution_endorsements;
create policy "read solution endorsements" on public.solution_endorsements for select using (auth.uid() is not null and public.current_profile_is_approved());

drop policy if exists "read request responses" on public.request_responses;
create policy "read request responses" on public.request_responses for select using (
  responder_id = auth.uid()
  or exists (select 1 from public.requests r where r.id = request_id and r.author_id = auth.uid())
  or public.current_profile_role() in ('curator', 'admin')
);

drop policy if exists "read case notes by visibility" on public.case_notes;
create policy "read case notes by visibility" on public.case_notes for select using (status = 'published' and public.can_read_visibility(visibility));

drop policy if exists "read solution pathways by visibility" on public.solution_pathways;
create policy "read solution pathways by visibility" on public.solution_pathways for select using (public.can_read_visibility(visibility));

drop policy if exists "contributors create organisations" on public.organisations;
create policy "contributors create organisations" on public.organisations for insert with check (auth.uid() = created_by and public.current_profile_is_approved());

drop policy if exists "contributors create district entries" on public.district_canvas_entries;
create policy "contributors create district entries" on public.district_canvas_entries for insert with check (auth.uid() = created_by and public.current_profile_access_tier() in ('trusted', 'internal'));

drop policy if exists "contributors create learning logs" on public.learning_logs;
create policy "contributors create learning logs" on public.learning_logs for insert with check (auth.uid() = submitted_by and public.current_profile_access_tier() in ('trusted', 'internal'));

drop policy if exists "trusted create solution pathways" on public.solution_pathways;
create policy "trusted create solution pathways" on public.solution_pathways for insert with check (auth.uid() = created_by and public.current_profile_access_tier() in ('trusted', 'internal'));

drop policy if exists "curators manage phase1 tables" on public.districts;
create policy "curators manage phase1 tables" on public.districts for all using (public.current_profile_role() in ('curator', 'admin')) with check (public.current_profile_role() in ('curator', 'admin'));

drop policy if exists "curators manage action labs" on public.action_labs;
create policy "curators manage action labs" on public.action_labs for all using (public.current_profile_role() in ('curator', 'admin')) with check (public.current_profile_role() in ('curator', 'admin'));
