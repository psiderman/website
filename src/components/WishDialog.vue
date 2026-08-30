<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="bg-overlay fixed inset-0 z-100 flex items-center justify-center backdrop-blur-xs"
        @click.self="emit('close')"
      >
        <div class="flex flex-col items-center justify-center gap-6 p-6">
          <WishCircle
            v-model:popping="popping"
            hint
            size="lg"
            @wished="emit('wished')"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import WishCircle from './WishCircle.vue'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'wished'): void
}>()

const popping = ref(false)

watch(popping, (p) => {
  if (!p) {
    emit('close')
  }
})
</script>