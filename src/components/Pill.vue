<template>
  <button class="pill" @click="openLink(link)">
    <fa v-if="brand" class="text-[14px]" :icon="['fab', brand]" />
    <img v-if="icon" class="h-5" :src="urls[icon]" alt="logo" />
    {{ text }}
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  brand: String,
  icon: String,
  link: String,
  text: String,
})

const urls = {
  envelope: new URL('@/assets/duotone/envelope.svg', import.meta.url).toString(),
}

function openLink(link) {
  if (link) window.open(link)
}
</script>

<style scoped>
@reference "tailwindcss";
.pill {
  @apply flex h-min flex-row items-center gap-x-2 rounded-full bg-white/10 px-3 py-0 text-base font-medium text-white/80 shadow-sm select-none;
  @apply hover:bg-white/20 hover:text-white hover:shadow-md;
  @apply active:bg-white/5 active:shadow-none;
}
</style>
