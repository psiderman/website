<script setup>
defineProps({
  title: String,
  description: String,
});
</script>
<template>
  <div class="absolute bottom-0 flex flex-col p-6">
    <div class="flex flex-row items-center gap-2 text-white/90">
      <slot />
      {{ title }}
    </div>
    <span class="text-xs text-white/60">{{ description }}</span>
  </div>
</template>
