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
                <TransitionGroup
                  name="carousel"
                  tag="div"
                  aria-hidden="true"
                  class="bg-dark text-light relative mx-auto flex h-30 w-full items-center justify-center gap-3 select-none"
                >
                  <div
                    v-for="offset in [-2, -1, 0, 1, 2]"
                    :key="activeIconIndex + offset"
                    class="flex items-center justify-center transition-[opacity,transform] duration-500 ease-out"
                    :class="[
                      offset === 0
                        ? isResting
                          ? currentItem.id === 'bot' || currentItem.id == 'face-angry'
                            ? 'animate-bot-shake scale-110 text-red-500 opacity-100'
                            : 'scale-110 text-green-500 opacity-100'
                          : 'text-light scale-100 opacity-100'
                        : Math.abs(offset) === 1
                          ? 'text-light scale-75 opacity-60'
                          : 'text-light scale-50 opacity-30',
                    ]"
                  >
                    <component :is="getIconItem(activeIconIndex + offset).icon" :size="32" />
                  </div>
                </TransitionGroup>
              </div>
              <div class="flex flex-col gap-2 px-6 pt-8 pb-4">
                <DialogTitle as="h2" class="text-h2 text-text-primary leading-7">
                  Everyone's welcome here <br />
                  and you don't <em>have</em> to log in but..
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
import { computed, onUnmounted, ref, watch } from 'vue'

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

const activeIconIndex = ref(0)
const isResting = ref(true)
const requestedClearance = ref(false)
let timer: null | ReturnType<typeof setInterval> = null
let restTimeout: null | ReturnType<typeof setTimeout> = null

const getIconItem = (index: number) => {
  const len = ICONS.length
  return ICONS[((index % len) + len) % len]
}

const currentItem = computed(() => getIconItem(activeIconIndex.value))

const stepCarousel = () => {
  isResting.value = false
  activeIconIndex.value++

  if (restTimeout) clearTimeout(restTimeout)
  restTimeout = setTimeout(() => {
    isResting.value = true
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
    if (open && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isResting.value = true
      timer = setInterval(stepCarousel, 1800)
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

.carousel-move,
.carousel-enter-active,
.carousel-leave-active {
  transition:
    opacity 0.5s ease-out,
    transform 0.5s ease-out;
}

.carousel-enter-from {
  opacity: 0;
  transform: translateX(16px) scale(0.4);
}

.carousel-leave-to {
  opacity: 0;
  transform: translateX(-16px) scale(0.4);
}

.carousel-leave-active {
  position: absolute;
}

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
