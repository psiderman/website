<template>
  <div
    class="bg-webp border-border-high-contrast flex h-full w-full flex-col items-center justify-start gap-10 overflow-hidden rounded-lg border bg-cyan-950 p-10 pb-0"
  >
    <img src="@/assets/svg/foursight-wordmark.svg" class="pointer-events-none h-8" />
    <img src="@/assets/images/app.webp" class="pointer-events-none shadow-xl" />
  </div>
</template>

<style scoped>
@reference "@/style.css";

.bg-webp {
  background: url('@/assets/images/bg.webp');
  @apply bg-cover bg-no-repeat;
}
</style>
