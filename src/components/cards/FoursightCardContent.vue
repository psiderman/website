<template>
  <div
    class="border-border-high-contrast relative flex h-full w-full flex-col items-center justify-start gap-10 overflow-hidden rounded-lg border p-10 pb-0"
  >
    <img
      src="@/assets/home/bg.webp"
      alt="bg"
      class="pointer-events-none absolute inset-0 z-0 h-full w-full bg-cyan-950 object-cover"
      width="713"
      height="436"
    />
    <img
      src="@/assets/home/foursight-wordmark.svg"
      class="pointer-events-none z-10 h-8"
      width="200"
      height="32"
      alt="foursight wordmark"
    />
    <img
      src="@/assets/home/app.webp"
      class="desktop:h-auto desktop:mb-0 pointer-events-none z-10 -mb-4 h-full w-auto rounded-lg object-contain object-bottom shadow-xl"
      width="633"
      height="445"
      alt="foursight screenshot"
    />
  </div>
</template>

<style scoped>
@reference "@/style.css";
</style>
