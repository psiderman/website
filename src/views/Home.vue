<script setup>
import Leftbar from "@/components/home/Leftbar.vue";
import WorkCard from "@/components/home/WorkCard.vue";
import NowCard from "@/components/home/NowCard.vue";
import LinkCard from "@/components/home/LinkCard.vue";
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
      <div class="grid grid-cols-2 gap-10">
        <a href="https://owensans.vercel.app" target="_blank">
          <LinkCard title="Owen Sans, font quiz">
            <img src="@/assets/images/owensans.png" alt="owen sans logo" />
            <img
              src="@/assets/duotone/external-link.svg"
              alt="link icon"
              class="absolute right-4 top-4 h-6"
            />
          </LinkCard>
        </a>
        <a href="https://kiwi.psiderman.com" target="_blank">
          <LinkCard title="Kiwi, personal finance">
            <img src="@/assets/images/kiwi.png" alt="owen sans logo" />
            <img
              src="@/assets/duotone/external-link.svg"
              alt="link icon"
              class="absolute right-4 top-4 h-6"
            />
          </LinkCard>
        </a>
        <a href="https://links.psiderman.com/primer" target="_blank">
          <LinkCard title="Personal finance 101">
            <img src="@/assets/images/primer.png" alt="owen sans logo" />
            <img
              src="@/assets/duotone/external-link.svg"
              alt="link icon"
              class="absolute right-4 top-4 h-6"
            /> </LinkCard
        ></a>
      </div>
      <div class="col-span-2 h-10"></div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.card {
  @apply relative h-80 rounded-3xl border border-white/5 bg-white/[2%];
  @apply select-none;
  @apply grayscale transition-all duration-200 hover:grayscale-0;
  @apply hover:border-white/10 hover:bg-white/[4%];
}

.figma-arrow:hover {
  cursor: url("@/assets/svg/figma-arrow.svg"), auto;
}
</style>
