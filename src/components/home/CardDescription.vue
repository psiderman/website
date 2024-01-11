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

const urls = {
  work: new URL("@/assets/duotone/work.svg", import.meta.url).toString(),
  backpack: new URL(
    "@/assets/duotone/backpack.svg",
    import.meta.url,
  ).toString(),
  now: new URL("@/assets/duotone/now.svg", import.meta.url).toString(),
  gaming: new URL("@/assets/duotone/gaming.svg", import.meta.url).toString(),
};
</script>
<template>
  <div :class="['flex flex-col p-6', flex ? '' : 'absolute bottom-0']">
    <div class="flex flex-row items-center gap-2 text-white/90">
      <img v-if="icon" :src="urls[icon]" alt="icon" class="h-6" />
      {{ title }}
    </div>
    <span class="text-xs text-white/60">{{ description }}</span>
  </div>
</template>
