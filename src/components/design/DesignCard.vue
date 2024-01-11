<script setup>
defineProps({
  title: String,
  year: String,
});
</script>

<template>
  <div
    class="design-card group relative col-span-1 row-span-1 shrink-0 select-none overflow-hidden rounded-2xl border border-white/20 bg-black hover:border-white/25"
  >
    <slot />
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 flex select-none flex-row justify-between p-4 text-base"
    >
      <span class="text-shadow text-white">{{ title }}</span>
      <span class="text-shadow text-white/80">{{ year }}</span>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.design-card::before {
  content: "";
  @apply absolute -bottom-16 h-48 w-full bg-gradient-to-b from-transparent to-black;
}

.text-shadow {
  text-shadow:
    0px 0px 4px rgba(0, 0, 0, 0.5),
    0px 0px 8px rgba(0, 0, 0, 0.1);
}
</style>
