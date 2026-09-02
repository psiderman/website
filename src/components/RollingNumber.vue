<template>
  <span class="inline-flex items-center tabular-nums">
    <span class="sr-only">{{ formattedValue !== '' ? formattedValue : '...' }}</span>
    <span v-if="value === null || value === undefined" aria-hidden="true">...</span>
    <span v-else aria-hidden="true" class="inline-flex items-baseline overflow-hidden">
      <span
        v-for="item in digits"
        :key="item.id"
        class="relative inline-grid overflow-hidden align-baseline"
      >
        <Transition :name="isInitialized ? 'digit-roll' : undefined" appear>
          <span :key="item.char" class="col-start-1 row-start-1 inline-block text-center">
            {{ item.char }}
          </span>
        </Transition>
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  value: null | number | string | undefined
}>()

const isInitialized = ref(false)

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return ''
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  if (typeof props.value === 'string') {
    const num = Number(props.value)
    if (!Number.isNaN(num) && props.value.trim() !== '') {
      return num.toLocaleString()
    }
  }
  return String(props.value)
})

const digits = computed(() => {
  if (props.value === null || props.value === undefined) return []
  const str = formattedValue.value
  const len = str.length
  return str.split('').map((char, index) => ({
    char,
    id: `pos-${len - 1 - index}`,
  }))
})

watch(
  () => props.value,
  (newVal) => {
    if (newVal !== null && newVal !== undefined && !isInitialized.value) {
      // Allow the initial value to render statically first before enabling animations
      void nextTick(() => {
        isInitialized.value = true
      })
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (props.value !== null && props.value !== undefined) {
    void nextTick(() => {
      isInitialized.value = true
    })
  }
})
</script>

<style scoped>
.digit-roll-enter-active,
.digit-roll-leave-active {
  transition:
    transform 0.5s ease-out,
    opacity 0.5s ease-out;
}

.digit-roll-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.digit-roll-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .digit-roll-enter-active,
  .digit-roll-leave-active {
    transition: none;
  }
}
</style>
