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
              class="bg-surface-primary border-border-primary relative flex min-h-40 w-100 flex-col items-center justify-center overflow-hidden rounded-xl border shadow-none!"
            >
              <div
                class="pointer-events-none z-10 flex h-full w-full flex-col justify-center gap-2 text-center"
              >
                <div
                  aria-hidden="true"
                  class="bg-dark text-light relative mx-auto flex h-30 w-full items-center justify-center overflow-hidden select-none"
                >
                  <!-- Gradient edge masks -->
                  <div
                    class="from-dark pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r to-transparent"
                  />
                  <div
                    class="from-dark pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l to-transparent"
                  />

                  <!-- Continuous sliding track -->
                  <div
                    class="absolute top-1/2 left-1/2 flex -translate-y-1/2 items-center will-change-transform"
                    :style="trackStyle"
                  >
                    <div
                      v-for="(item, idx) in trackItems"
                      :key="idx"
                      class="flex h-16 w-16 shrink-0 items-center justify-center will-change-transform"
                      :class="[
                        isTransitioning
                          ? 'transition-all duration-500 ease-out'
                          : 'transition-none',
                        getItemClass(idx),
                      ]"
                    >
                      <component :is="item.icon" :size="32" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2 px-6 pt-8 pb-4">
                <DialogTitle as="h2" class="text-h2 text-text-primary leading-7">
                  Everyone's welcome here <br />
                  and you don’t <em>have</em> to log in but..
                </DialogTitle>
                <p class="text-ui text-text-secondary">
                  Some experiences may need you to interact with others. A login helps fight bots,
                  spam, and abuse.
                </p>
              </div>

              <div class="z-10 flex w-full flex-col items-center gap-2 p-4">
                <button class="btn primary w-full" @click="signInWithGoogle">
                  <FA :icon="['fab', 'google']" class="text-ui-small" />
                  Continue with Google
                </button>
                <label
                  for="theList"
                  class="text-ui hover:bg-hover text-text-secondary flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 align-baseline select-none"
                >
                  <input
                    id="theList"
                    v-model="requestedClearance"
                    name="theList"
                    type="checkbox"
                    class="custom-checkbox"
                    aria-label="request access to “the list”"
                  />
                  <span>request access to “the list”</span>
                  <span
                    v-tooltip="{ content: 'yes, <i>the</i> list', allowHTML: true }"
                    class="border-light flex size-4 items-center justify-center rounded-full border bg-green-500 shadow-sm"
                    @click.stop
                  >
                    <Star :size="10" fill="#fff" stroke-width="0" />
                  </span>
                </label>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Bird, Bot, Dog, FaceAngry, FaceSlightlySmiling, Star } from '@lucide/vue'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

import { supabase } from '@/supabase'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const ICONS = [
  { icon: FaceSlightlySmiling, id: 'face-slightly-smiling' },
  { icon: Bot, id: 'bot' },
  { icon: Dog, id: 'dog' },
  { icon: FaceAngry, id: 'face-angry' },
  { icon: Bird, id: 'bird' },
] as const

const ITEM_WIDTH = 64
const trackItems = [...ICONS, ...ICONS, ...ICONS]
const midIndex = Math.floor(trackItems.length / 2) // 7

const currentIndex = ref(5)
const isResting = ref(true)
const isTransitioning = ref(true)
const requestedClearance = ref(false)

let timer: null | ReturnType<typeof setInterval> = null
let restTimeout: null | ReturnType<typeof setTimeout> = null

const currentItem = computed(() => ICONS[currentIndex.value % ICONS.length])

const trackStyle = computed(() => {
  const offset = (currentIndex.value - midIndex) * ITEM_WIDTH
  return {
    transform: `translateX(calc(-50% - ${offset}px))`,
    transition: isTransitioning.value ? 'transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
  }
})

const getItemClass = (idx: number) => {
  const diff = Math.abs(idx - currentIndex.value)
  if (diff === 0) {
    if (isResting.value) {
      if (currentItem.value.id === 'bot' || currentItem.value.id === 'face-angry') {
        return 'animate-bot-shake scale-110 text-red-500 opacity-100'
      }
      return 'scale-110 text-green-500 opacity-100'
    }
    return 'text-light scale-100 opacity-100'
  }
  if (diff === 1) {
    return 'text-light scale-75 opacity-60'
  }
  if (diff === 2) {
    return 'text-light scale-50 opacity-30'
  }
  return 'text-light scale-25 opacity-0'
}

const stepCarousel = () => {
  isResting.value = false
  isTransitioning.value = true
  currentIndex.value++

  if (restTimeout) clearTimeout(restTimeout)
  restTimeout = setTimeout(async () => {
    isResting.value = true
    if (currentIndex.value >= 10) {
      isTransitioning.value = false
      currentIndex.value = 5
      await nextTick()
    }
  }, 500)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (restTimeout) {
    clearTimeout(restTimeout)
    restTimeout = null
  }
}

watch(
  () => props.isOpen,
  (open) => {
    stopTimer()
    if (open) {
      currentIndex.value = 5
      isResting.value = true
      isTransitioning.value = true
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = setInterval(stepCarousel, 1800)
      }
    }
  },
  { immediate: true },
)

onUnmounted(stopTimer)

const closeModal = () => {
  emit('update:isOpen', false)
}

const signInWithGoogle = async () => {
  const redirectUrl = new URL(window.location.href)

  if (requestedClearance.value) {
    sessionStorage.setItem('requested_clearance', 'true')
    redirectUrl.searchParams.set('requested_clearance', 'true')
  } else {
    sessionStorage.removeItem('requested_clearance')
    redirectUrl.searchParams.delete('requested_clearance')
  }

  const { error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: redirectUrl.toString(),
    },
    provider: 'google',
  })

  if (error) {
    console.error('Error logging in:', error.message)
  }
}
</script>

<style scoped>
@reference "@/style.css";

@keyframes bot-shake {
  0%,
  100% {
    transform: translateX(0) scale(1.1);
  }
  20% {
    transform: translateX(-4px) rotate(-5deg) scale(1.1);
  }
  40% {
    transform: translateX(4px) rotate(5deg) scale(1.1);
  }
  60% {
    transform: translateX(-3px) rotate(-3deg) scale(1.1);
  }
  80% {
    transform: translateX(3px) rotate(3deg) scale(1.1);
  }
}

.animate-bot-shake {
  animation: bot-shake 0.45s ease-in-out;
}
</style>
