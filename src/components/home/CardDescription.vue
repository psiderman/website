<script setup>
const props = defineProps({
  title: String,
  description: String,
  icon: String,
  flex: {
    type: Boolean,
    default: false,
  },
});

function getImageUrl() {
  return new URL(props.icon, import.meta.url).toString();
}
</script>
<template>
  <div :class="['flex flex-col p-6', flex ? '' : 'absolute bottom-0']">
    <div class="flex flex-row items-center gap-2 text-white/90">
      <img :src="getImageUrl()" alt="icon" class="h-6" />
      {{ title }}
    </div>
    <span class="text-xs text-white/60">{{ description }}</span>
  </div>
</template>
