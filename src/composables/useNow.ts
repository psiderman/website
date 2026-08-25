import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

import { supabase } from '@/supabase'

export function useNow() {
  // 1. Fetch latest post slug
  const {
    data: posts,
    error: slugError,
    isLoading: isLoadingSlug,
  } = useQuery({
    queryFn: async () => {
      const { data, error } = await supabase
        .from('now')
        .select('date')
        .eq('is_active', true)
        .order('date', { ascending: false })
        .limit(1)

      if (error) throw error
      return data
    },
    queryKey: ['now-posts'],
  })

  const slug = computed(() => {
    return posts.value && posts.value.length > 0 ? posts.value[0].date.substring(0, 7) : null
  })

  // 2. Fetch images (only runs if slug is available)
  const { data: images, isLoading: isLoadingImages } = useQuery({
    enabled: computed(() => !!slug.value),
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('now').list(slug.value!)
      if (error) throw error

      return data
        .filter((file) => !file.name.endsWith('.md'))
        .map((file) => {
          const { data: urlData } = supabase.storage
            .from('now')
            .getPublicUrl(`${slug.value}/${file.name}`)
          return {
            name: file.name,
            url: urlData.publicUrl,
          }
        })
    },
    queryKey: ['now-images', slug],
  })

  // 3. Fetch markdown content (only runs if slug is available)
  const {
    data: markdownContent,
    error: markdownError,
    isLoading: isLoadingMarkdown,
  } = useQuery({
    enabled: computed(() => !!slug.value),
    queryFn: async () => {
      if (import.meta.env.DEV) {
        const { data: urlData } = supabase.storage
          .from('now')
          .getPublicUrl(`${slug.value}/${slug.value}.md`)
        const response = await fetch(`${urlData.publicUrl}?t=${new Date().getTime()}`)
        if (!response.ok) throw new Error('Failed to fetch markdown')
        return await response.text()
      } else {
        const { data, error } = await supabase.storage
          .from('now')
          .download(`${slug.value}/${slug.value}.md`)
        if (error) throw error
        return await data.text()
      }
    },
    queryKey: ['now-markdown', slug],
  })

  return {
    images,
    isLoadingImages,
    isLoadingMarkdown,
    isLoadingSlug,
    markdownContent,
    markdownError,
    slug,
    slugError,
  }
}
