<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('update:isOpen', false)">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-overlay fixed inset-0 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-full"
            enter-to="opacity-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 translate-y-full"
          >
            <DialogPanel
              class="bg-surface-primary border-border-primary text-text-primary flex w-full max-w-120 flex-col gap-4 rounded-t-2xl border p-6 shadow-2xl"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-h3 font-semibold">Add Quote</h3>
                <button
                  type="button"
                  aria-label="Close modal"
                  class="hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                  @click="$emit('update:isOpen', false)"
                >
                  <X :size="18" />
                </button>
              </div>

              <form class="flex flex-col gap-3" @submit.prevent="addQuote">
                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Clearance</span>
                  <ClearanceSelect
                    v-model="newQuoteForm.clearance"
                    :levels="quoteClearanceLevels"
                    variant="compact"
                  />
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Title</span>
                  <input
                    v-model="newQuoteForm.title"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    type="text"
                    placeholder="Optional title"
                  />
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Date</span>
                  <input
                    v-model="newQuoteForm.date"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    type="date"
                    required
                  />
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Content</span>
                  <textarea
                    v-model="newQuoteForm.content"
                    rows="4"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    placeholder="Short sentence / excerpt..."
                    required
                  ></textarea>
                </label>

                <div class="flex gap-2 pt-2">
                  <button
                    class="btn primary"
                    type="submit"
                    :disabled="isAddingQuote || !newQuoteForm.content.trim()"
                  >
                    {{ isAddingQuote ? 'Adding...' : 'Add Quote' }}
                  </button>
                  <button class="btn stroke" type="button" @click="$emit('update:isOpen', false)">
                    Cancel
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X } from '@lucide/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { reactive, ref, watch } from 'vue'

import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'

import { quoteClearanceLevels } from '../../utils/clearance'
import ClearanceSelect from '../ui/ClearanceSelect.vue'

import type { ClearanceLevel } from '@/types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const queryClient = useQueryClient()

const newQuoteForm = reactive<{
  clearance: ClearanceLevel
  content: string
  date: string
  title: string
}>({
  clearance: 'public',
  content: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  title: '',
})

const isAddingQuote = ref(false)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      newQuoteForm.clearance = 'public'
      newQuoteForm.content = ''
      newQuoteForm.date = format(new Date(), 'yyyy-MM-dd')
      newQuoteForm.title = ''
    }
  },
)

async function addQuote() {
  const content = newQuoteForm.content.trim()
  if (!content) return

  isAddingQuote.value = true
  try {
    const { error } = await supabase.from('quotes').insert({
      clearance: newQuoteForm.clearance,
      content,
      date: newQuoteForm.date,
      title: newQuoteForm.title.trim() || null,
    })

    if (error) throw error

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.quotes })
    await queryClient.invalidateQueries({ queryKey: queryKeys.quotes })

    emit('update:isOpen', false)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to add quote: ${errorMsg}`)
  } finally {
    isAddingQuote.value = false
  }
}
</script>
