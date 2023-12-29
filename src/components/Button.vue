<script setup>
defineProps({
  text: String,
  brand: String,
  icon: String,
  reverse: {
    type: Boolean,
    default: false,
  },
});

const urls = {
  "arrow-left": new URL(
    "@/assets/duotone/arrow-left.svg",
    import.meta.url,
  ).toString(),
  "arrow-right": new URL(
    "@/assets/duotone/arrow-right.svg",
    import.meta.url,
  ).toString(),
};
</script>
<template>
  <button :class="['button', reverse ? 'flex-row-reverse' : 'flex-row']">
    {{ text }}
    <fa v-if="brand" class="w-min text-[14px]" :icon="['fab', brand]" />
    <img v-if="icon" class="h-6 w-min" :src="urls[icon]" alt="icon" />
  </button>
</template>

<style lang="postcss" scoped>
.button {
  @apply flex select-none items-center gap-x-1 overflow-hidden rounded-full border-2 border-white/25 px-4 py-2 text-base font-medium text-white/80 shadow-sm;
  background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    linear-gradient(
      0deg,
      rgba(37, 99, 235, 0.2) 0%,
      rgba(37, 99, 235, 0.2) 100%
    ),
    #000;
}
.button:hover {
  @apply border-white/35 shadow-lg;
  background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    linear-gradient(
      0deg,
      rgba(37, 99, 235, 0.33) 0%,
      rgba(37, 99, 235, 0.33) 100%
    ),
    #000;
}
.button:active {
  @apply border-white/10 shadow-none;
  background: linear-gradient(
      0deg,
      rgba(37, 99, 235, 0.2) 0%,
      rgba(37, 99, 235, 0.2) 100%
    ),
    #000;
}
</style>
