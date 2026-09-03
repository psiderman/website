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
                <h3 class="text-h3 font-semibold">Add Person</h3>
                <button
                  type="button"
                  aria-label="Close modal"
                  class="hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                  @click="$emit('update:isOpen', false)"
                >
                  <X :size="18" />
                </button>
              </div>

              <form class="flex flex-col gap-3" @submit.prevent="addPerson">
                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Organization</span>
                  <div
                    class="bg-surface-primary border-border-primary text-text-primary text-ui relative flex h-10.5 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                  >
                    <span>
                      {{
                        availableOrgs.find((o) => o.id === newPersonForm.orgId)?.name ||
                        'Select organization'
                      }}
                    </span>
                    <ChevronDown :size="14" class="shrink-0 opacity-70" />
                    <select
                      v-model="newPersonForm.orgId"
                      class="absolute inset-0 size-full cursor-pointer opacity-0"
                      required
                    >
                      <option v-for="org in availableOrgs" :key="org.id" :value="org.id">
                        {{ org.name }}
                      </option>
                    </select>
                  </div>
                </label>

                <div class="flex items-center gap-4">
                  <div
                    class="bg-surface-secondary border-border-primary flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                  >
                    <img
                      v-if="imagePreviewUrl"
                      :src="imagePreviewUrl"
                      alt="Preview"
                      class="size-full object-cover"
                    />
                    <span v-else class="text-ui-small text-text-tertiary uppercase">
                      {{ newPersonForm.name ? newPersonForm.name.charAt(0) : '?' }}
                    </span>
                  </div>

                  <div class="flex flex-1 flex-col gap-1">
                    <span class="text-ui-small text-text-tertiary pl-1.5">Profile Picture</span>
                    <label
                      class="btn stroke text-ui-small flex w-fit cursor-pointer items-center gap-2"
                    >
                      <Upload :size="14" />
                      <span>{{
                        isConvertingImage
                          ? 'Converting...'
                          : selectedImageFile
                            ? 'Change image'
                            : 'Select image'
                      }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        :disabled="isConvertingImage"
                        @change="onImageFileSelected"
                      />
                    </label>
                    <p v-if="selectedImageFile" class="text-ui-small text-text-secondary truncate">
                      {{ selectedImageFile.name }} (400×400 .webp)
                    </p>
                  </div>
                </div>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Name</span>
                  <input
                    v-model="newPersonForm.name"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    type="text"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">LinkedIn URL</span>
                  <input
                    v-model="newPersonForm.linkedin"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                  />
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Quote</span>
                  <textarea
                    v-model="newPersonForm.quote"
                    rows="2"
                    class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                    placeholder="Optional quote"
                  ></textarea>
                </label>

                <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                  <span class="pl-1.5">Department</span>
                  <div
                    class="bg-surface-primary border-border-primary text-text-primary text-ui relative flex h-10.5 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                  >
                    <span>{{ newPersonForm.dept }}</span>
                    <ChevronDown :size="14" class="shrink-0 opacity-70" />
                    <select
                      v-model="newPersonForm.dept"
                      class="absolute inset-0 size-full cursor-pointer opacity-0"
                      required
                    >
                      <option v-for="dept in DEPARTMENTS" :key="dept" :value="dept">
                        {{ dept }}
                      </option>
                    </select>
                  </div>
                </label>

                <div class="flex gap-2 pt-2">
                  <button
                    class="btn primary"
                    type="submit"
                    :disabled="isAddingPerson || !newPersonForm.name || !newPersonForm.orgId"
                  >
                    {{ isAddingPerson ? 'Adding...' : 'Add Person' }}
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
import { ChevronDown, Upload, X } from '@lucide/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref, watch } from 'vue'

import { workHistory } from '@/data/work'
import { queryKeys } from '@/queryKeys'
import { supabase } from '@/supabase'
import { type Department, DEPARTMENTS } from '@/types'

import { convertToSquareWebp } from '../../utils/image'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const queryClient = useQueryClient()

const availableOrgs = computed(() => {
  const map = new Map<string, string>()
  workHistory.forEach((w) => {
    if (w.orgId) map.set(w.orgId, w.orgName)
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})

const newPersonForm = reactive({
  dept: 'Design' as Department,
  linkedin: '',
  name: '',
  orgId: '',
  quote: '',
})

const isAddingPerson = ref(false)
const isConvertingImage = ref(false)
const selectedImageFile = ref<File | null>(null)
const imagePreviewUrl = ref<null | string>(null)

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      if (!newPersonForm.orgId && availableOrgs.value.length > 0) {
        newPersonForm.orgId = availableOrgs.value[0].id
      }
      selectedImageFile.value = null
      if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value)
        imagePreviewUrl.value = null
      }
    }
  },
)

async function addPerson() {
  if (!newPersonForm.orgId || !newPersonForm.name) return

  isAddingPerson.value = true
  try {
    const cleanImageName = selectedImageFile.value
      ? selectedImageFile.value.name.replace(/\.[^/.]+$/, '').trim()
      : newPersonForm.name.toLowerCase().trim().replace(/\s+/g, '-')

    if (selectedImageFile.value) {
      const { error: uploadError } = await supabase.storage
        .from('webp')
        .upload(`${newPersonForm.orgId}/${cleanImageName}.webp`, selectedImageFile.value, {
          contentType: 'image/webp',
          upsert: true,
        })

      if (uploadError) throw uploadError
    }

    const { error } = await supabase.from('work_people').insert({
      dept: newPersonForm.dept,
      imageName: cleanImageName,
      linkedin: newPersonForm.linkedin.trim() || null,
      name: newPersonForm.name.trim(),
      orgId: newPersonForm.orgId,
      quote: newPersonForm.quote.trim() || null,
    })

    if (error) throw error

    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.workPeople })
    await queryClient.invalidateQueries({ queryKey: queryKeys.workPeople.list })

    newPersonForm.dept = 'Design'
    newPersonForm.name = ''
    newPersonForm.linkedin = ''
    newPersonForm.quote = ''
    selectedImageFile.value = null
    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
      imagePreviewUrl.value = null
    }
    emit('update:isOpen', false)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to add person: ${errorMsg}`)
  } finally {
    isAddingPerson.value = false
  }
}

async function onImageFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isConvertingImage.value = true
  try {
    const webpFile = await convertToSquareWebp(file)
    selectedImageFile.value = webpFile

    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
    }
    imagePreviewUrl.value = URL.createObjectURL(webpFile)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to convert image: ${errorMsg}`)
    target.value = ''
  } finally {
    isConvertingImage.value = false
  }
}
</script>
