<template>
  <div
    class="text-text-inverted-primary maps-bg z-10 flex h-full w-full flex-col items-center justify-center gap-0"
  >
    <p class="text-h1">🚧</p>
    <p class="text-h1">making smth cool here</p>
  </div>
</template>

<style scoped>
@reference "@/style.css";
.maps-bg {
  background: url('@/assets/images/travel.jpeg');
  @apply bg-cover;
}

.maps-bg::before {
  content: '';
  @apply bg-coal/50 absolute inset-0 -z-10;
}
</style>
