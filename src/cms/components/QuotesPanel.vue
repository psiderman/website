<template>
  <div class="flex flex-col gap-3 p-4">
    <div>
      <button
        class="btn stroke text-ui-small flex w-full cursor-pointer items-center justify-center gap-1.5 py-2.5"
        type="button"
        @click="isAddQuoteModalOpen = true"
      >
        <Plus :size="16" /> Add quote
      </button>
    </div>

    <Disclosure
      v-for="quote in quotesList"
      :key="quote.id"
      v-slot="{ close }"
      as="div"
      class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
    >
      <DisclosureButton
        class="flex w-full cursor-pointer flex-row items-center justify-between p-3 text-left"
      >
        <div class="flex min-w-0 flex-col gap-0">
          <p class="text-ui text-text-primary truncate font-medium">
            {{ quote.title || quote.content }}
          </p>
          <p class="text-ui-small text-text-secondary truncate">
            {{ formatQuoteDate(quote.date) }}
            <span v-if="quote.title"> · {{ quote.content }}</span>
          </p>
        </div>
        <div class="flex shrink-0 flex-row items-center gap-2">
          <ClearanceSelect
            :model-value="getEditQuoteForm(quote).clearance"
            :levels="quoteClearanceLevels"
            select-label="Change quote clearance level"
            variant="compact"
            @update:model-value="getEditQuoteForm(quote).clearance = $event"
            @change="saveQuoteClearance(quote)"
          />
        </div>
      </DisclosureButton>

      <DisclosurePanel
        class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
      >
        <div class="flex flex-col gap-2">
          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Clearance</span>
            <ClearanceSelect
              v-model="getEditQuoteForm(quote).clearance"
              :levels="quoteClearanceLevels"
              variant="compact"
            />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Title</span>
            <input
              v-model="getEditQuoteForm(quote).title"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="text"
              placeholder="Optional title"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Date</span>
            <input
              v-model="getEditQuoteForm(quote).date"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              type="date"
            />
          </label>

          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
            <span class="pl-1.5">Content</span>
            <textarea
              v-model="getEditQuoteForm(quote).content"
              rows="4"
              class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
              placeholder="Quote content..."
            ></textarea>
          </label>
        </div>

        <div class="flex items-center justify-between gap-2 pt-2">
          <div class="flex gap-2">
            <button
              class="btn primary"
              type="button"
              :disabled="savingQuoteId === quote.id"
              @click="saveQuote(quote, close)"
            >
              {{ savingQuoteId === quote.id ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn stroke" type="button" @click="resetQuote(quote)">Reset</button>
          </div>
          <button
            class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
            type="button"
            @click="deleteQuote(quote.id)"
          >
            Delete
          </button>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <AddQuoteModal v-model:is-open="isAddQuoteModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { Plus } from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'

import { isAdmin } from '@/composables/useAuth'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import { quoteClearanceLevels } from '../utils/clearance'
import { formatQuoteDate } from '../utils/format'
import AddQuoteModal from './modals/AddQuoteModal.vue'
import ClearanceSelect from './ui/ClearanceSelect.vue'

import type { QuoteForm, QuoteRecord } from '../types'

const queryClient = useQueryClient()

const editQuoteForms = reactive<Record<string, QuoteForm>>({})
const savingQuoteId = ref<null | string>(null)
const isAddQuoteModalOpen = ref(false)

const { data: quotesList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []) as QuoteRecord[]
  },
  queryKey: queryKeys.admin.quotes,
})

async function deleteQuote(id: string) {
  if (!confirm('Are you sure you want to delete this quote?')) return

  try {
    const { error } = await supabase.from('quotes').delete().eq('id', id)
    if (error) throw error

    delete editQuoteForms[id]

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.quotes })
    await queryClient.invalidateQueries({ queryKey: queryKeys.quotes })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete quote: ${errorMsg}`)
  }
}

function getEditQuoteForm(quote: QuoteRecord): QuoteForm {
  if (!editQuoteForms[quote.id]) {
    editQuoteForms[quote.id] = {
      clearance: quote.clearance || 'public',
      content: quote.content || '',
      date: quote.date ? (quote.date.length >= 10 ? quote.date.slice(0, 10) : quote.date) : '',
      id: quote.id,
      title: quote.title || '',
    }
  }
  return editQuoteForms[quote.id]
}

function resetQuote(quote: QuoteRecord) {
  editQuoteForms[quote.id] = {
    clearance: quote.clearance || 'public',
    content: quote.content || '',
    date: quote.date ? (quote.date.length >= 10 ? quote.date.slice(0, 10) : quote.date) : '',
    id: quote.id,
    title: quote.title || '',
  }
}

async function saveQuote(quote: QuoteRecord, close?: () => void) {
  const form = getEditQuoteForm(quote)
  const trimmedContent = form.content.trim()
  if (!trimmedContent) {
    alert('Quote content cannot be empty.')
    return
  }

  const trimmedTitle = form.title.trim() || null

  savingQuoteId.value = quote.id
  try {
    const { error } = await supabase
      .from('quotes')
      .update({
        clearance: form.clearance,
        content: trimmedContent,
        date: form.date,
        title: trimmedTitle,
      })
      .eq('id', quote.id)

    if (error) throw error

    quote.content = trimmedContent
    quote.clearance = form.clearance
    quote.date = form.date
    quote.title = trimmedTitle

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.quotes })
    await queryClient.invalidateQueries({ queryKey: queryKeys.quotes })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save quote: ${errorMsg}`)
  } finally {
    savingQuoteId.value = null
  }
}

async function saveQuoteClearance(quote: QuoteRecord) {
  const form = getEditQuoteForm(quote)
  try {
    const { error } = await supabase
      .from('quotes')
      .update({
        clearance: form.clearance,
      })
      .eq('id', quote.id)

    if (error) throw error

    quote.clearance = form.clearance

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.quotes })
    await queryClient.invalidateQueries({ queryKey: queryKeys.quotes })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to update quote clearance: ${errorMsg}`)
  }
}
</script>
