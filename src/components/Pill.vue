<script setup>
defineProps({
  text: String,
  brand: String,
});
</script>
<template>
  <button class="pill">
    <slot name="icon"></slot>
    <fa v-if="brand" class="w-min text-[14px]" :icon="['fab', brand]" />
    {{ text }}
  </button>
</template>

<style lang="postcss" scoped>
.pill {
  @apply flex h-min select-none flex-row items-center gap-x-2 rounded-full bg-white/10 px-3 py-0 text-base font-medium text-white/80 shadow-sm;
  @apply hover:bg-white/20 hover:text-white hover:shadow-md;
  @apply active:bg-white/5 active:shadow-none;
}
</style>
