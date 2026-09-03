<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="bg-surface-primary border-border-primary -mt-2 flex h-10.5 w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left select-none"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="text-ui text-text-primary">{{ label }}</span>
    <div
      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out"
      :class="
        modelValue ? 'bg-surface-inverted' : 'bg-surface-secondary border-border-primary border'
      "
    >
      <span
        class="bg-surface-primary inline-block size-3.5 transform rounded-full shadow transition duration-200 ease-in-out"
        :class="modelValue ? 'translate-x-4.5' : 'translate-x-0.5'"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>
