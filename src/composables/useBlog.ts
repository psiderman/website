import { useQuery } from '@tanstack/vue-query'
import { format, parse } from 'date-fns'
import { computed, type Ref } from 'vue'

import { currentUser, ensureUserRole } from '@/composables/useAuth'
import { supabase } from '@/supabase'

import type { ClearanceLevel } from '@/composables/useTravel'

export interface BlogPost {
  clearance: ClearanceLevel
  date: Date
  excerpt: string
  // Whether the current viewer may read this post's content. Always false when
  // not signed in (except public posts). Used by the list to show locks.
  hasAccess: boolean
  isActive: boolean
  minutes: number
  slug: string
  title: string
}

export type BlogPostAccess = 'denied' | 'granted' | 'public'

export interface BlogPostContent {
  access: BlogPostAccess
  markdown: string
}

const CLEARANCE_RANK: Record<ClearanceLevel, number> = {
  admin: 5,
  auth: 1,
  close: 4,
  friends: 3,
  known: 2,
  public: 0,
}

export function hasBlogAccess(required: ClearanceLevel, role: null | string): boolean {
  // 'public' is the only level readable without signing in. Everything else —
  // even 'auth' — needs a signed-in user whose role clears it. The blog table
  // listing is public (titles/excerpts), but the actual files never are.
  if (required === 'public') return true
  if (!role) return false
  const roleRank = CLEARANCE_RANK[role as ClearanceLevel]
  if (roleRank === undefined) return false
  return roleRank >= CLEARANCE_RANK[required]
}

export function useBlogPost(slug: Ref<string> | string) {
  const slugRef = computed(() => (typeof slug === 'string' ? slug : slug.value))

  const {
    data: post,
    error: postError,
    isLoading: isLoadingPost,
  } = useQuery<BlogPost | null>({
    enabled: computed(() => !!slugRef.value),
    queryFn: async () => {
      if (!slugRef.value) return null

      await supabase.auth.getSession()

      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .eq('slug', slugRef.value)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      return data ? rowToBlogPost(data as Record<string, unknown>) : null
    },
    queryKey: ['blog-post', slugRef],
  })

  const {
    data: content,
    error: contentError,
    isLoading: isLoadingContent,
  } = useQuery<BlogPostContent | null>({
    enabled: computed(() => !!post.value),
    queryFn: async () => {
      if (!post.value) return null

      const p = post.value
      const role = await ensureUserRole()

      if (!hasBlogAccess(p.clearance, effectiveRole(role))) {
        return {
          access: 'denied',
          markdown: '',
        }
      }

      const storagePath =
        p.clearance === 'public' ? `${p.slug}/${p.slug}.md` : `pvt/${p.slug}/${p.slug}.md`
      const { data, error } = await supabase.storage
        .from('blog')
        .download(storagePath, { cacheNonce: format(new Date(), 'yyMM') })
      if (error) throw error

      return {
        access: p.clearance === 'public' ? 'public' : 'granted',
        markdown: await data.text(),
      }
    },
    queryKey: ['blog-post-content', slugRef],
  })

  return {
    content,
    contentError,
    error: computed(() => postError.value || contentError.value),
    isLoading: computed(() => isLoadingPost.value || isLoadingContent.value),
    isNotFound: computed(() => !isLoadingPost.value && !postError.value && post.value === null),
    post,
  }
}

export function useBlogPosts() {
  const {
    data: posts,
    error,
    isLoading,
  } = useQuery<BlogPost[]>({
    queryFn: async () => {
      await supabase.auth.getSession()

      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: false })

      if (error) throw error

      const rows = (data ?? []).map((row) => rowToBlogPost(row as Record<string, unknown>))
      const role = await ensureUserRole()

      // Return the full catalog — every post, locked or not — each tagged with
      // whether the current viewer can actually read it. The list UI decides
      // how to present locked rows (title/date/minutes + lock icon, no excerpt).
      return rows.map((post) => ({
        ...post,
        hasAccess: hasBlogAccess(post.clearance, effectiveRole(role)),
      }))
    },
    queryKey: ['blog-posts'],
  })

  return { error, isLoading, posts }
}

// Mirrors the DB's has_clearance(): a signed-in user with no user_roles row is
// treated as rank 1 ('auth'). Kept separate from hasBlogAccess so logged-out
// users (role null) are still denied non-public posts.
function effectiveRole(role: null | string): null | string {
  if (role) return role
  return currentUser.value ? 'auth' : null
}

function rowToBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    clearance: (row.clearance as ClearanceLevel) || 'admin',
    // Postgres `date` returns "YYYY-MM-DD"; parsing it as local midnight avoids
    // the UTC-midnight off-by-one that shifts dates a day early west of UTC.
    date: parse(row.date as string, 'yyyy-MM-dd', new Date()),
    excerpt: (row.excerpt as string) ?? '',
    hasAccess: false,
    isActive: (row.is_active as boolean) ?? true,
    minutes: (row.minutes as number) ?? 2,
    slug: row.slug as string,
    title: (row.title as string) ?? (row.slug as string),
  }
}
