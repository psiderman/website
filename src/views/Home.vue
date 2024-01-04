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
    )
    .add({
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
    class="mx-auto my-auto flex w-full max-w-screen-lg flex-col gap-4 px-10 py-20 md:gap-10 lg:flex-row lg:px-0"
  >
    <Leftbar />

    <!-- Right bar -->
    <div class="grid h-full w-full gap-4 md:grid-cols-2 md:gap-10">
      <RouterLink class="rounded-3xl" to="/design">
        <WorkCard />
      </RouterLink>
      <RouterLink class="rounded-3xl" to="/now">
        <NowCard />
      </RouterLink>
      <RouterLink class="rounded-3xl" to="/backpacking">
        <TravelCard />
      </RouterLink>
      <div class="grid grid-cols-2 grid-rows-2 gap-4 md:gap-10">
        <LinkCard
          title="Owen Sans, font quiz"
          logo="owensans"
          link="https://owensans.vercel.app"
        />
        <LinkCard
          title="Kiwi, personal finance"
          logo="kiwi"
          link="https://kiwi.psiderman.com"
        />
        <LinkCard
          title="Personal finance 101"
          logo="primer"
          link="://links.psiderman.com/primer"
        />
        <LinkCard
          title="Public Playlists"
          logo="spotify"
          link="https://open.spotify.com/user/psiderman/playlists"
        />
      </div>
      <RouterLink to="/gaming" class="rounded-3xl">
        <GamingCard />
      </RouterLink>
      <div class="grid grid-cols-2 gap-4 md:grid-rows-2 md:gap-10">
        <RouterLink to="/404" class="rounded-3xl">
          <div class="card card-small">
            <img
              class="h-full w-full object-contain p-8"
              src="@/assets/svg/psider.svg"
              alt="psider logo"
            />
          </div>
        </RouterLink>
      </div>
      <div
        class="anime-entry col-span-1 flex w-full select-none flex-col text-center text-base text-white/50 md:col-span-2 lg:col-span-1 lg:text-left"
      >
        <span> ©️ Karan Sanas {{ new Date().getFullYear() }} </span>
        <span>
          <a
            href="https://github.com/psiderman/website"
            target="_blank"
            class="underline underline-offset-4 hover:text-white/80"
            >Handcrafted</a
          >, with love.
        </span>
      </div>
    </div>
  </div>
</template>
