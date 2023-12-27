<script setup>
import Leftbar from "@/components/home/Leftbar.vue";
import WorkCard from "@/components/home/WorkCard.vue";
import NowCard from "@/components/home/NowCard.vue";
</script>

<template>
  <!-- Content -->
  <div
    class="mx-auto flex h-screen max-h-dvh w-screen max-w-screen-lg flex-row gap-10 overflow-scroll py-20"
  >
    <Leftbar />

    <!-- Right bar -->
    <div class="grid min-h-fit w-full grid-cols-2 gap-10">
      <WorkCard />
      <NowCard />
      <div class="card"></div>
      <div class="grid grid-cols-2 gap-10">
        <div class="card card-small"></div>
        <div class="card card-small"></div>
        <div class="card card-small"></div>
      </div>
      <div class="col-span-2 h-10"></div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.card {
  @apply relative h-80 rounded-3xl border border-white/5 bg-white/[2%];
  @apply select-none;
  @apply grayscale transition-all duration-500 hover:grayscale-0;
}

.card-small {
  @apply h-[140px];
}

.figma-arrow:hover {
  cursor: url("@/assets/svg/figma-arrow.svg"), auto;
}
</style>
