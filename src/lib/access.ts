import type { AccessTier, Profile, UserRole, Visibility } from '@/lib/types/database'

export const curatorRoles: UserRole[] = ['curator', 'admin']
export const trustedRoles: UserRole[] = ['seeker', 'contributor', 'mentor', 'partner', 'curator', 'admin']

export function isCuratorRole(role?: string | null) {
  return role === 'curator' || role === 'admin'
}

export function isAdminRole(role?: string | null) {
  return role === 'admin'
}

export function getAccessTier(profile?: Pick<Profile, 'role' | 'access_tier'> | null): AccessTier {
  if (!profile) return 'registered'
  if (profile.access_tier) return profile.access_tier
  if (isCuratorRole(profile.role)) return 'internal'
  if (trustedRoles.includes(profile.role)) return 'trusted'
  return 'registered'
}

export function canSeeVisibility(profile: Pick<Profile, 'role' | 'access_tier' | 'is_approved'> | null | undefined, visibility: Visibility) {
  if (visibility === 'public') return true
  if (!profile?.is_approved && !isCuratorRole(profile?.role)) return false
  const tier = getAccessTier(profile)
  if (visibility === 'registered') return ['registered', 'trusted', 'internal'].includes(tier)
  if (visibility === 'trusted') return ['trusted', 'internal'].includes(tier)
  return tier === 'internal' || isCuratorRole(profile.role)
}

export function roleLabel(role?: string | null) {
  return (role ?? 'contributor').replaceAll('_', ' ')
}
