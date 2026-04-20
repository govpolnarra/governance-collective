export type UserRole = 'member' | 'curator' | 'admin'
export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived'
export type RequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ContentType = 'playbook' | 'solution' | 'learning_resource' | 'request'

export interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  organisation: string | null
  role: UserRole
  is_approved: boolean
  linkedin_url: string | null
  expertise: string[] | null
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
  outcomes: string | null
  sector: string | null
  state: string | null
  tags: string[] | null
  status: ContentStatus
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
  implementation_details: string | null
  outcomes: string | null
  sector: string | null
  tags: string[] | null
  status: ContentStatus
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
  tags: string[] | null
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
  sector: string | null
  status: RequestStatus
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name' | 'organisation'>
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
