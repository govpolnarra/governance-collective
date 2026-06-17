export type UserRole =
  | 'member'
  | 'contributor'
  | 'seeker'
  | 'solution_provider'
  | 'mentor'
  | 'partner'
  | 'curator'
  | 'admin'
export type AccessTier = 'registered' | 'trusted' | 'internal'
export type Visibility = 'public' | 'registered' | 'trusted' | 'internal'
export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'revision_requested' | 'returned' | 'rejected' | 'archived'
export type RequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ContentType =
  | 'playbook'
  | 'solution'
  | 'learning_resource'
  | 'request'
  | 'case_note'
  | 'learning_log'
  | 'solution_pathway'
export type EvidenceLabel = 'field_note' | 'pilot' | 'replicated' | 'systemic'
export type ReplicationReadiness = 'red' | 'amber' | 'green'

export interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  organisation: string | null
  role: UserRole
  access_tier: AccessTier | null
  is_approved: boolean
  password_set: boolean
  linkedin_url: string | null
  email: string | null
  phone: string | null
  expertise: string[] | null
  geographies: string[] | null
  sectors: string[] | null
  methods: string[] | null
  availability: 'open' | 'on_request' | 'not_available' | null
  recognition_level: string | null
  created_at: string
  updated_at: string
}

export interface Playbook {
  id: string
  author_id: string
  title: string
  summary: string | null
  problem_statement: string | null
  approach: string | null
  root_cause_chain: string | null
  intervention_design: string | null
  what_happened: string | null
  what_failed_or_surprised: string | null
  enabling_conditions: string | null
  actor_map: string | null
  relational_layer: string | null
  timeline_and_cost: string | null
  replication_readiness: ReplicationReadiness | null
  evidence_label: EvidenceLabel | null
  outcomes: string | null
  sector: string | null
  state: string | null
  district: string | null
  tags: string[] | null
  visibility: Visibility
  status: ContentStatus
  curator_note: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name' | 'organisation'>
}

export interface Solution {
  id: string
  author_id: string
  name: string
  description: string | null
  problem_addressed: string | null
  model_type: string | null
  evidence_level: string | null
  geographies_of_validation: string[] | null
  government_interface: string | null
  adoption_conditions: string | null
  implementation_cost_range: string | null
  implementation_details: string | null
  outcomes: string | null
  risks_and_constraints: string | null
  contact_path: string | null
  sector: string | null
  tags: string[] | null
  visibility: Visibility
  status: ContentStatus
  curator_note: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name' | 'organisation'>
}

export interface LearningResource {
  id: string
  author_id: string
  title: string
  summary: string | null
  resource_url: string | null
  resource_type: string | null
  audience: 'inside_government' | 'outside_government' | 'both' | null
  duration_minutes: number | null
  body: string | null
  derived_from_type: string | null
  derived_from_id: string | null
  tags: string[] | null
  visibility: Visibility
  status: ContentStatus
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name'>
}

export interface Request {
  id: string
  author_id: string
  title: string
  description: string | null
  need_type: string | null
  problem_context: string | null
  state: string | null
  district: string | null
  sector: string | null
  timeline: string | null
  tags: string[] | null
  visibility: Visibility
  contact_path: string | null
  status: RequestStatus
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name' | 'organisation'>
}

export interface District {
  id: string
  state: string
  district_name: string
  district_type: string | null
  summary: string | null
  priority_themes: string[] | null
  active_problem_count: number
  canvas_visibility: Visibility
  created_at: string
  updated_at: string
}

export interface DistrictCanvasEntry {
  id: string
  district_id: string
  entry_type: 'priority' | 'active_problem' | 'decision' | 'actor' | 'handover_note' | 'bottleneck' | 'opportunity' | 'context_note'
  title: string
  description: string | null
  status: 'active' | 'closed' | 'deferred' | 'watch' | null
  visibility: Visibility
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ActionLab {
  id: string
  title: string
  district_id: string | null
  state_priority_theme: string | null
  district_specific_track: boolean
  problem_statement: string | null
  root_cause_summary: string | null
  primary_indicator: string | null
  secondary_indicators: string[] | null
  stage: 'diagnose' | 'design' | 'embed' | 'measure' | 'replicate' | 'closed'
  status: 'active' | 'blocked' | 'paused' | 'completed'
  lead_fellow_ids: string[] | null
  solution_anchor_id: string | null
  government_counterpart: string | null
  review_owner_id?: string | null
  review_notes?: string | null
  visibility: Visibility
  start_date: string | null
  next_review_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  districts?: Pick<District, 'district_name' | 'state'>
}

export interface LearningLog {
  id: string
  action_lab_id: string
  log_type: 'daily_capture' | 'weekly_log' | 'monthly_synthesis' | 'quarterly_review_note'
  date: string | null
  location: string | null
  what_was_tried: string | null
  what_was_observed: string | null
  what_was_learned: string | null
  what_changes_next: string | null
  blockers: string | null
  support_needed: string | null
  decision_notes?: string | null
  review_notes?: string | null
  converted_to_type?: string | null
  converted_to_id?: string | null
  visibility: Visibility
  submitted_by: string | null
  created_at: string
  updated_at: string
}

export interface SolutionPathway {
  id: string
  title: string
  problem_statement: string | null
  district_id: string | null
  action_lab_id: string | null
  architecture_summary: string | null
  root_cause?: string | null
  actors?: string | null
  government_levers: string[] | null
  solution_ids: string[] | null
  expert_ids: string[] | null
  possible_solutions?: string | null
  actor_changes: string | null
  sequence: string | null
  measurement_plan: string | null
  risks: string | null
  adoption_conditions?: string | null
  curator_note?: string | null
  status: 'draft' | 'under_review' | 'active' | 'archived'
  visibility: Visibility
  created_by: string | null
  created_at: string
  updated_at: string
  districts?: Pick<District, 'district_name' | 'state'>
  action_labs?: Pick<ActionLab, 'title'>
}

export interface CurationQueueItem {
  id: string
  content_id: string
  content_type: ContentType
  submitted_by: string
  reviewed_by: string | null
  review_notes: string | null
  reviewed_at: string | null
  status: ContentStatus
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name'>
}

export interface Bookmark {
  id: string
  user_id: string
  content_id: string
  content_type: ContentType
  created_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  actor_id: string | null
  event_type: string
  title: string
  body: string | null
  href: string | null
  metadata: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}
