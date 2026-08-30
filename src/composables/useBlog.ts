import { useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { computed, type Ref } from 'vue'

import { ensureUserRole } from '@/composables/useAuth'
import { supabase } from '@/supabase'

import type { ClearanceLevel } from '@/composables/useTravel'

export interface BlogImage {
  name: string
  url: string
}

export interface BlogPost {
  clearance: ClearanceLevel
  coverUrl: null | string
  date: Date
  excerpt: string
  isActive: boolean
  minutes: number
  slug: string
  title: string
}

export type BlogPostAccess = 'denied' | 'granted' | 'public'

export interface BlogPostContent {
  access: BlogPostAccess
  coverUrl: null | string
  images: BlogImage[]
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

      if (!hasBlogAccess(p.clearance, role)) {
        return {
          access: 'denied',
          coverUrl: null,
          images: [],
          markdown: '',
        }
      }

      const mdPath = `${p.slug}/${p.slug}.md?v=${format(new Date(), 'yyyyMMdd')}`
      const imgPrefix = `${p.slug}/`

      const mdQuery = supabase.storage.from('blog').download(mdPath)
      const listQuery = supabase.storage.from('blog').list(imgPrefix)

      const [mdRes, listRes] = await Promise.all([mdQuery, listQuery])
      if (mdRes.error) throw mdRes.error

      const files = (listRes.data ?? []).filter(
        (file) => !file.name.endsWith('.md') && file.name !== 'cover.webp',
      )

      const signedImages = await Promise.all(
        files.map(async (file) => {
          const url = await signStoragePath(`${imgPrefix}${file.name}`)
          if (!url) return null
          return { name: file.name, url }
        }),
      )

      const images = signedImages.filter((i): i is BlogImage => i !== null)
      const coverUrl = await signStoragePath(`${p.slug}/cover.webp`)

      return {
        access: p.clearance === 'public' ? 'public' : 'granted',
        coverUrl,
        images,
        markdown: await mdRes.data.text(),
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

      const accessible = rows.filter((post) => hasBlogAccess(post.clearance, role))

      return Promise.all(
        accessible.map(async (post) => {
          return { ...post, coverUrl: await signStoragePath(`${post.slug}/cover.webp`) }
        }),
      )
    },
    queryKey: ['blog-posts'],
    staleTime: 0,
  })

  return { error, isLoading, posts }
}

function rowToBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    clearance: (row.clearance as ClearanceLevel) || 'admin',
    coverUrl: null,
    date: new Date(row.date as string),
    excerpt: (row.excerpt as string) ?? '',
    isActive: (row.is_active as boolean) ?? true,
    minutes: (row.minutes as number) ?? 2,
    slug: row.slug as string,
    title: (row.title as string) ?? (row.slug as string),
  }
}

async function signStoragePath(storagePath: string): Promise<null | string> {
  const { data, error } = await supabase.storage.from('blog').createSignedUrl(storagePath, 60 * 60)
  if (error || !data) return null
  return data.signedUrl
}
