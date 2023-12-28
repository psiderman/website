<script setup>
const props = defineProps({
  title: String,
  description: String,
  icon: String,
});

function getImageUrl() {
  return new URL(props.icon, import.meta.url).toString();
}
</script>
<template>
  <div class="absolute bottom-0 flex flex-col p-6">
    <div class="flex flex-row items-center gap-2 text-white/90">
      <img :src="getImageUrl()" alt="laptop icon" class="h-6" />
      {{ title }}
    </div>
    <span class="text-xs text-white/60">{{ description }}</span>
  </div>
</template>
