<template>
  <div class="flex flex-col gap-3 p-4">
    <Disclosure
      v-for="post in blogPostsList"
      :key="post.slug"
      v-slot="{ close }"
      as="div"
      class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
    >
      <DisclosureButton
        class="flex w-full cursor-pointer flex-row items-center justify-between p-3 text-left"
      >
        <div class="flex min-w-0 flex-col gap-0">
          <p class="text-ui text-text-primary truncate font-medium">{{ post.title }}</p>
          <p class="text-ui-small text-text-secondary truncate">
            {{ formatBlogDate(post.date) }}
          </p>
        </div>
        <div class="flex shrink-0 flex-row items-center gap-2">
          <span class="text-ui-small text-text-tertiary px-2 uppercase">
            {{ post.clearance }}
          </span>
          <span
            v-if="!getEditBlogForm(post).is_active"
            v-tooltip="{ content: 'Inactive' }"
            class="text-text-secondary flex size-6 items-center justify-center"
          >
            <span class="size-2 rounded-full bg-red-500"></span>
          </span>
        </div>
      </DisclosureButton>

      <DisclosurePanel
        class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
      >
        <div class="flex flex-col gap-2">
          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Clearance</span>
            <ClearanceSelect
              v-model="getEditBlogForm(post).clearance"
              :levels="blogClearanceLevels"
              badge-class="h-6 w-1.5"
            />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Title</span>
            <input
              v-model="getEditBlogForm(post).title"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Date</span>
            <input
              v-model="getEditBlogForm(post).date"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="date"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Minutes</span>
            <input
              v-model.number="getEditBlogForm(post).minutes"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="number"
              min="0"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Slug</span>
            <input
              v-model="getEditBlogForm(post).slug"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Excerpt</span>
            <textarea
              v-model="getEditBlogForm(post).excerpt"
              rows="3"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
            ></textarea>
          </label>
        </div>

        <ToggleSwitch v-model="getEditBlogForm(post).is_active" label="Is Active" />

        <div class="flex items-center justify-between gap-2 pt-2">
          <div class="flex gap-2">
            <button
              class="btn primary"
              type="button"
              :disabled="savingBlogSlug === post.slug"
              @click="saveBlog(post, close)"
            >
              {{ savingBlogSlug === post.slug ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn stroke" type="button" @click="resetBlog(post)">Reset</button>
          </div>
          <button
            class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
            type="button"
            @click="deleteBlog(post.slug)"
          >
            Delete
          </button>
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import { clearanceLevels } from '../utils/clearance'
import { formatBlogDate } from '../utils/format'
import ClearanceSelect from './ui/ClearanceSelect.vue'
import ToggleSwitch from './ui/ToggleSwitch.vue'

import type { BlogForm, BlogPostRecord } from '../types'
import type { ClearanceLevel } from '@/types'

const queryClient = useQueryClient()

const blogClearanceLevels: ClearanceLevel[] = [...clearanceLevels, 'public']

const editBlogForms = reactive<Record<string, BlogForm>>({})
const savingBlogSlug = ref<null | string>(null)

const { data: blogPostsList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []) as BlogPostRecord[]
  },
  queryKey: queryKeys.admin.blog,
})

// The blog storage layout is `{slug}/{slug}.md` for public posts and
// `pvt/{slug}/{slug}.md` for anything above public (mirrors useBlog.ts).
function blogStoragePath(slug: string, clearance: ClearanceLevel): string {
  const base = `${slug}/${slug}.md`
  return clearance === 'public' ? base : `pvt/${base}`
}

async function deleteBlog(slug: string) {
  if (!confirm(`Are you sure you want to delete blog post "${slug}"?`)) return

  try {
    const { error } = await supabase.from('blog').delete().eq('slug', slug)
    if (error) throw error

    delete editBlogForms[slug]

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.blog })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.list })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.post(slug) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.content(slug) })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete blog post: ${errorMsg}`)
  }
}

function getEditBlogForm(post: BlogPostRecord): BlogForm {
  if (!editBlogForms[post.slug]) {
    editBlogForms[post.slug] = {
      clearance: post.clearance || 'public',
      date: post.date ? (post.date.length >= 10 ? post.date.slice(0, 10) : post.date) : '',
      excerpt: post.excerpt || '',
      is_active: !!post.is_active,
      minutes: post.minutes ?? null,
      slug: post.slug,
      title: post.title || '',
    }
  }
  return editBlogForms[post.slug]
}

async function hasBlogFile(path: string): Promise<boolean> {
  const parts = path.split('/')
  const folder = parts.slice(0, -1).join('/')
  const filename = parts[parts.length - 1]
  const { data, error } = await supabase.storage.from('blog').list(folder, { limit: 1000 })
  if (error) throw error
  return (data || []).some((o) => o.name === filename)
}

function resetBlog(post: BlogPostRecord) {
  editBlogForms[post.slug] = {
    clearance: post.clearance || 'public',
    date: post.date ? (post.date.length >= 10 ? post.date.slice(0, 10) : post.date) : '',
    excerpt: post.excerpt || '',
    is_active: !!post.is_active,
    minutes: post.minutes ?? null,
    slug: post.slug,
    title: post.title || '',
  }
}

async function saveBlog(post: BlogPostRecord, close?: () => void) {
  const form = getEditBlogForm(post)
  const oldSlug = post.slug
  const newSlug = form.slug.trim()
  const oldClearance = post.clearance
  const newClearance = form.clearance
  savingBlogSlug.value = oldSlug

  if (!newSlug) {
    alert('Slug cannot be empty.')
    savingBlogSlug.value = null
    return
  }

  const oldPath = blogStoragePath(oldSlug, oldClearance)
  const newPath = blogStoragePath(newSlug, newClearance)
  const needsMove = oldPath !== newPath

  try {
    // Guard against slug collisions before touching anything.
    if (newSlug !== oldSlug) {
      const { data: clash, error: clashError } = await supabase
        .from('blog')
        .select('slug')
        .eq('slug', newSlug)
        .maybeSingle()
      if (clashError) throw clashError
      if (clash) throw new Error(`A post with the slug “${newSlug}” already exists.`)
    }

    // Move the markdown file first so a failure leaves the DB untouched.
    if (needsMove) {
      if (!(await hasBlogFile(oldPath))) {
        throw new Error(`Blog file not found at “${oldPath}”.`)
      }
      if (await hasBlogFile(newPath)) {
        throw new Error(`Destination file already exists at “${newPath}”.`)
      }
      const { error: moveError } = await supabase.storage.from('blog').move(oldPath, newPath)
      if (moveError) throw moveError
    }

    // minutes must stay > 0 (DB CHECK); collapse empty/zero back to null.
    const minutes = form.minutes && form.minutes > 0 ? form.minutes : null

    const { error } = await supabase
      .from('blog')
      .update({
        clearance: newClearance,
        date: form.date,
        excerpt: form.excerpt.trim() || null,
        is_active: form.is_active,
        minutes,
        slug: newSlug,
        title: form.title,
      })
      .eq('slug', oldSlug)

    if (error) {
      // Best-effort rollback of the file move.
      if (needsMove) {
        await supabase.storage.from('blog').move(newPath, oldPath)
      }
      throw error
    }

    post.title = form.title
    post.clearance = newClearance
    post.date = form.date
    post.excerpt = form.excerpt.trim() || null
    post.is_active = form.is_active
    post.minutes = minutes
    post.slug = newSlug

    if (newSlug !== oldSlug) {
      delete editBlogForms[oldSlug]
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.blog })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.list })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.post(newSlug) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.content(newSlug) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.post(oldSlug) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.blog.content(oldSlug) })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save blog post: ${errorMsg}`)
  } finally {
    savingBlogSlug.value = null
  }
}
</script>
