<template>
  <!-- Content -->

  <div
    class="mx-auto my-auto flex w-full max-w-screen-lg flex-col gap-4 px-10 py-20 md:gap-10 lg:flex-row lg:px-0"
  >
    <Leftbar />

    <!-- Right bar -->
    <div class="grid h-full w-full gap-4 md:grid-cols-2 md:gap-10">
      <RouterLink class="rounded-3xl" to="/now">
        <NowCard />
      </RouterLink>
      <RouterLink class="rounded-3xl" to="/design">
        <PortfolioCard />
      </RouterLink>

      <div class="grid grid-cols-2 grid-rows-2 gap-4 md:gap-10">
        <LinkCard
          title="Public Playlists"
          logo="spotify"
          link="https://open.spotify.com/user/psiderman/playlists"
        />
        <!-- <SpotifyCard /> -->
        <LinkCard
          title="Owen Sans, font quiz"
          logo="owensans"
          link="https://owensans.vercel.app"
        />
        <LinkCard
          title="Foursight"
          logo="foursight"
          link="https://foursight.money"
        />
        <LinkCard
          title="Personal finance 101"
          logo="primer"
          link="https://links.psiderman.com/primer"
        />
      </div>

      <RouterLink class="rounded-3xl" to="/backpacking">
        <TravelCard />
      </RouterLink>

      <RouterLink to="/gaming" class="rounded-3xl">
        <GamingCard />
      </RouterLink>
      <div></div>
      <div
        class="col-span-1 flex w-full flex-col text-center text-base text-white/50 select-none md:col-span-2 lg:col-span-1 lg:text-left"
      >
        <span class="anime-entry">
          ©️ Karan Sanas {{ new Date().getFullYear() }}
        </span>
        <span class="anime-entry"
          >Handcrafted with Figma, Vue.js, no AI content, and&nbsp;&nbsp;<fa
            :class="[heartFill ? 'text-red-500' : '', 'cursor-pointer']"
            :icon="[heartFill ? 'fas' : 'far', 'heart']"
            @click="fillHeart"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import anime from "animejs";
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import GamingCard from "@/components/home/GamingCard.vue";
import Leftbar from "@/components/home/Leftbar.vue";
import LinkCard from "@/components/home/LinkCard.vue";
// import SpotifyCard from "@/components/home/SpotifyCard.vue";
import NowCard from "@/components/home/NowCard.vue";
import PortfolioCard from "@/components/home/PortfolioCard.vue";
import TravelCard from "@/components/home/TravelCard.vue";

const heartFill = ref(false);

function fillHeart() {
  heartFill.value = !heartFill.value;
}

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
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutBack",
        opacity: [0, 1],
        scale: [0.95, 1],
        targets: ".leftbar-headshot",
        transformOrigin: "center",
        translateY: ["1rem", "0"],
      },
      0,
    )
    .add(
      {
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutBack",
        opacity: [0, 1],
        scale: [0.95, 1],
        targets: ".pill",
        transformOrigin: "center",
        translateY: ["1rem", "0"],
      },
      0,
    )
    .add({
      delay: anime.stagger(100),
      duration: 500,
      easing: "easeOutBack",
      opacity: [0, 1],
      scale: [0.95, 1],
      targets: ".card, .anime-entry",
      transformOrigin: "center",
      translateY: ["3rem", "0"],
    });
});
</script>

<style  scoped>
@reference "tailwindcss";
.social {
  @apply relative col-span-1 row-span-1 aspect-square shrink-0 overflow-hidden rounded-lg border border-white/5 bg-white/[2%];
  @apply select-none;
  @apply grayscale transition-colors duration-200 hover:grayscale-0;
  @apply hover:border-white/10;
}
</style>
