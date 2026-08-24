<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
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
        <div class="flex min-h-full items-start justify-center p-10 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="bg-surface-primary border-border-primary relative flex h-fit w-180 flex-col items-center justify-center gap-0 overflow-hidden rounded-xl border"
            >
              <div
                class="bg-background border-border-primary flex h-20 w-full flex-row items-center justify-between border-b px-6 py-5"
              >
                <div class="flex flex-row gap-2 text-left">
                  <img :src="getLogoUrl('dezerv')" class="rounded-special size-10" />
                  <div class="flex flex-col">
                    <h2 class="text-h2 text-text-primary">Dezerv</h2>
                    <p class="text-ui-small text-text-tertiary">February 2025–December 2025</p>
                  </div>
                </div>
                <!-- <div class="flex flex-row gap-2">
                  <button class="btn icon-only stroke">
                    <ArrowLeft :size="16" />
                  </button>

                  <button class="btn icon-only stroke">
                    <ArrowRight :size="16" />
                  </button>
                </div> -->
              </div>

              <div class="border-border-primary flex w-full flex-row gap-10 border-b p-10">
                <div
                  class="bg-surface-secondary border-border-primary relative h-90 w-72 shrink-0 overflow-hidden rounded-lg border"
                >
                  <img
                    src="@/assets/images/travel.webp"
                    class="image-print absolute inset-0 m-auto max-h-80 max-w-60 -rotate-5"
                  />
                  <img
                    src="@/assets/images/travel.webp"
                    class="image-print absolute inset-0 m-auto max-h-80 max-w-60 rotate-7"
                  />
                  <img
                    src="@/assets/images/travel.webp"
                    class="image-print absolute inset-0 m-auto max-h-80 max-w-60 rotate-1"
                  />
                </div>
                <div
                  class="text-text-primary text-ui flex h-auto w-full grow flex-col items-center justify-center gap-6 text-left"
                >
                  <p>
                    Dezerv is a wealth management platform managing ₹15,000+ Crores for its clients.
                    I joined as a Senior Product Designer.
                  </p>
                  <p>
                    I started my contribution to the product by designing the experience for
                    tracking National Pension Scheme investments on the Wealth Monitor app.
                  </p>
                  <p>
                    After that, I rebuilt the design infrastructure connecting four fragmented
                    products, then used it to ship Dezerv Web, a desktop platform used by both
                    clients and Relationship Managers.
                  </p>
                </div>
              </div>

              <div class="border-border-primary flex w-full flex-row gap-6 border-b p-10 text-left">
                <div class="text-text-primary text-ui flex w-full flex-col gap-2">
                  <p class="text-ui-small text-text-tertiary tracking-wider uppercase">
                    Projects I worked on directly
                  </p>
                  <div
                    class="hover:bg-hover -mx-2 -my-1 flex w-fit cursor-pointer flex-row items-center gap-2 rounded-lg px-2 py-1 text-blue-700 underline visited:text-purple-700"
                  >
                    <p>Dezerv Web</p>
                    <ArrowUpRight :size="16" />
                  </div>
                  <div
                    class="hover:bg-hover -mx-2 -my-1 flex w-fit cursor-pointer flex-row items-center gap-2 rounded-lg px-2 py-1 text-blue-700 underline visited:text-purple-700"
                  >
                    <p>Prosper Design System</p>
                    <ArrowUpRight :size="16" />
                  </div>
                  <p>Tracking NPS in Wealth Monitor</p>
                  <p>Consolidating Wealth Monitor into the Dezerv App</p>
                  <p>Hiring and Interviews</p>
                </div>

                <div class="text-text-primary text-ui-small flex w-full flex-col gap-2">
                  <p class="text-text-tertiary tracking-wider uppercase">
                    People I worked with directly
                  </p>
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                      <p>Product</p>
                      <div class="flex flex-row flex-wrap gap-1">
                        <img
                          v-for="i in 5"
                          :key="i"
                          src="@/assets/images/public.webp"
                          class="image-print size-10 rounded-full border object-cover outline-0"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-2">
                      <p>Engineering</p>
                      <div class="flex flex-row flex-wrap gap-1">
                        <img
                          v-for="i in 7"
                          :key="i"
                          src="@/assets/images/public.webp"
                          class="image-print size-10 rounded-full border object-cover outline-0"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-2">
                      <p>Design</p>
                      <div class="flex flex-row flex-wrap gap-1">
                        <img
                          v-for="i in 10"
                          :key="i"
                          src="@/assets/images/public.webp"
                          class="image-print size-10 rounded-full border object-cover outline-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="bg-background text-text-secondary flex w-full flex-row items-center justify-between p-10"
              >
                <div class="text-ui-small flex flex-col text-left">
                  <p>Dezerv Investments Pvt. Ltd.</p>
                  <p>$40M Series C | Premji Invest | Accel</p>
                </div>
                <div
                  class="bg-surface-secondary border-border-primary text-text-secondary text-ui hover:text-text-primary flex flex-row items-center justify-center gap-0.5 rounded-full border px-3 py-0.5 transition-colors"
                  :class="{ 'hover:border-border-hover cursor-pointer': true }"
                >
                  dezerv.in
                  <ArrowUpRight v-if="true" :size="16" />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ArrowUpRight } from '@lucide/vue'
import { watch } from 'vue'

import { global } from '@/composables/useGlobal'
import { supabase } from '@/supabase'

const getLogoUrl = (orgId: string) => {
  return supabase.storage.from('logos').getPublicUrl(`${orgId}.webp`).data.publicUrl
}

export interface LightBoxTag {
  link?: string
  value: string
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      global.activeModal.value = 'work'
    } else if (global.activeModal.value === 'work') {
      global.activeModal.value = null
    }
  },
)
</script>

<style scoped>
@reference "@/style.css";
</style>
