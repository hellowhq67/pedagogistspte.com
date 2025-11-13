'use server'

import 'server-only'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CacheTags } from './cache'

// Next 16: revalidateTag requires a cacheLife profile as the second argument
// Support common profiles and inline object
type CacheLifeProfile =
  | 'max'
  | 'hours'
  | 'days'
  | { revalidate: number }
  | { expire: number }

/**
 * Revalidate specific cache tags
 */
export async function revalidateCacheTags(
  tags: string[],
  profile: CacheLifeProfile = 'max'
) {
  for (const tag of tags) {
    // Casting profile to align with Next 16 types without leaking into app types
    revalidateTag(tag, profile as any)
  }
}

/**
 * Revalidate user-related caches
 */
export async function revalidateUserCache(userId: string) {
  revalidateTag(CacheTags.USER, 'max')
  revalidateTag(`${CacheTags.USER_PROFILE}-${userId}`, 'max')
  revalidateTag(`${CacheTags.USER_SUBSCRIPTION}-${userId}`, 'max')
}

/**
 * Revalidate PTE test caches
 */
export async function revalidatePTECache() {
  revalidateTag(CacheTags.PTE_TESTS, 'max')
  revalidateTag(CacheTags.PTE_QUESTIONS, 'max')
}

/**
 * Revalidate test attempt caches for a user
 */
export async function revalidateUserAttempts(userId: string) {
  revalidateTag(`${CacheTags.PTE_ATTEMPTS}-${userId}`, 'max')
  revalidateTag(`${CacheTags.PTE_HISTORY}-${userId}`, 'max')
}

/**
 * Revalidate community caches
 */
export async function revalidateCommunityCache() {
  revalidateTag(CacheTags.COMMUNITY_POSTS, 'max')
  revalidateTag(CacheTags.COMMUNITY_TRENDING, 'max')
  revalidateTag(CacheTags.COMMUNITY_CONTRIBUTORS, 'max')
}

/**
 * Revalidate specific paths
 */
export async function revalidateAppPath(path: string) {
  revalidatePath(path)
}

/**
 * Clear all PTE-related caches (use sparingly)
 */
export async function revalidateAllPTE() {
  Object.values(CacheTags).forEach((tag) => {
    if (tag.startsWith('pte-') || tag.startsWith('PTE_')) {
      revalidateTag(tag, 'max')
    }
  })
}
