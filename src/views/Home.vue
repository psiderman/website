<script setup>
import Leftbar from "@/components/home/Leftbar.vue";
import WorkCard from "@/components/home/WorkCard.vue";
import NowCard from "@/components/home/NowCard.vue";
import LinkCard from "@/components/home/LinkCard.vue";
import TravelCard from "@/components/home/TravelCard.vue";

import { RouterLink } from "vue-router";
import { onMounted } from "vue";
import anime from "animejs";

onMounted(() => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gradient = `radial-gradient(circle at ${x}px ${y}px, hsla(0, 0%, 100%, 5%) 0%, hsla(0, 0%, 100%, 2%) 80%)`;
      card.style.setProperty("background", gradient);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("background", "hsla(0,0%,100%,2%)");
    });
  });

  const entrance = anime.timeline({});
  entrance
    .add(
      {
        targets: ".leftbar-headshot",
        translateY: ["1rem", "0"],
        opacity: [0, 1],
        scale: [0.95, 1],
        transformOrigin: "center",
        duration: 500,
        easing: "easeOutBack",
        delay: anime.stagger(100),
      },
      0,
    )
    .add(
      {
        targets: ".pill",
        translateY: ["1rem", "0"],
        opacity: [0, 1],
        scale: [0.95, 1],
        transformOrigin: "center",
        duration: 500,
        easing: "easeOutBack",
        delay: anime.stagger(100),
      },
      0,
    );
  entrance.add({
    targets: ".card",
    translateY: ["3rem", "0"],
    opacity: [0, 1],
    scale: [0.95, 1],
    transformOrigin: "center",
    duration: 500,
    easing: "easeOutBack",
    delay: anime.stagger(100),
  });
});
</script>

<template>
  <!-- Content -->
  <div
    class="mx-auto flex h-screen max-h-dvh w-screen max-w-screen-lg flex-row gap-10 overflow-scroll py-20"
  >
    <Leftbar />

    <!-- Right bar -->
    <div class="grid min-h-fit w-full grid-cols-2 gap-10">
      <RouterLink to="/design">
        <WorkCard />
      </RouterLink>
      <RouterLink to="/now">
        <NowCard />
      </RouterLink>
      <RouterLink to="/backpacking">
        <TravelCard />
      </RouterLink>
      <div class="grid grid-cols-2 gap-10">
        <a href="https://owensans.vercel.app" target="_blank">
          <LinkCard title="Owen Sans, font quiz" logo="owensans" />
        </a>
        <a href="https://kiwi.psiderman.com" target="_blank">
          <LinkCard title="Kiwi, personal finance" logo="kiwi" />
        </a>
        <a href="https://links.psiderman.com/primer" target="_blank">
          <LinkCard title="Personal finance 101" logo="primer" />
        </a>
      </div>
      <div class="col-span-2 h-10"></div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.card {
  @apply relative h-80 overflow-hidden rounded-3xl border border-white/5 bg-white/[2%];
  @apply select-none;
  @apply grayscale transition-colors duration-200 hover:grayscale-0;
  @apply hover:border-white/10;
}

.card::before {
  content: "";
  @apply absolute inset-0;
  opacity: 0.3;
  background-image: url(../assets/images/noise.png);
  background-repeat: repeat;
  background-size: 100px;
}
</style>
