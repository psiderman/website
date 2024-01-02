<script setup>
import Leftbar from "@/components/home/Leftbar.vue";
import WorkCard from "@/components/home/WorkCard.vue";
import NowCard from "@/components/home/NowCard.vue";
import LinkCard from "@/components/home/LinkCard.vue";
import TravelCard from "@/components/home/TravelCard.vue";
import GamingCard from "@/components/home/GamingCard.vue";

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
    targets: ".card, .anime-entry",
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
    class="m-auto flex h-screen max-h-[900px] w-screen max-w-screen-lg flex-col gap-10 overflow-scroll p-10 py-20 lg:flex-row lg:p-0 lg:py-20"
  >
    <Leftbar />

    <!-- Right bar -->
    <div class="flex min-h-fit w-full grid-cols-2 flex-col gap-10 sm:grid">
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
        <a
          href="https://open.spotify.com/user/psiderman/playlists"
          target="_blank"
        >
          <LinkCard title="Public Playlists" logo="spotify" />
        </a>
      </div>
      <RouterLink to="/gaming">
        <GamingCard />
      </RouterLink>
      <div class="grid grid-cols-2 gap-10">
        <RouterLink to="/404">
          <div class="card card-small">
            <img
              class="h-full w-full object-contain p-2"
              src="@/assets/svg/psider.svg"
              alt="psider logo"
            />
          </div>
        </RouterLink>
      </div>
      <p class="anime-entry w-full text-base text-white/50">
        ©️ Karan Sanas {{ new Date().getFullYear() }} <br />
        Hand crafted in Vue.js, with love.
      </p>
      <div class="col-span-2 h-10"></div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.card {
  @apply h-80;
}
.card-small {
  @apply flex flex-col p-4;
  height: 140px !important;
}
</style>
