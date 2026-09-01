<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="() => {}">
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

      <div
        class="fixed inset-0 overflow-y-auto"
        :style="{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }"
      >
        <div class="flex min-h-full items-center justify-center p-4 text-center">
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
              class="bg-surface-inverted dark:bg-surface-primary border-light-10p relative flex min-h-80 w-100 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border p-10 backdrop-blur-3xl"
            >
              <h1 v-reveal class="text-ui text-light/50 w-full tracking-wider uppercase">
                Achievement Unlocked
              </h1>
              <p v-reveal="200" class="text-display text-light -mt-4 w-full text-balance">
                Professional Web Slinger
              </p>

              <div v-reveal="400">
                <img :src="badgeSvg" alt="award" />
              </div>

              <button
                v-reveal="600"
                class="btn stroke dark:bg-light dark:text-dark mt-8 w-full cursor-pointer"
                @click="acceptAchievement"
              >
                Accept award
              </button>
              <button v-reveal="600" class="btn inverted w-full cursor-pointer" @click="closeModal">
                Close
              </button>
            </DialogPanel></TransitionChild
          >
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { getEasterEggAwardPng, getEasterEggBadgeSvg } from '@/data/thwipEasterEgg'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const badgeSvg = getEasterEggBadgeSvg()

function acceptAchievement() {
  const link = document.createElement('a')
  link.href = getEasterEggAwardPng()
  link.download = 'achievement.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function closeModal() {
  emit('close')
}
</script>
