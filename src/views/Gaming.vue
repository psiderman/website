<script setup>
import { ref, onMounted, nextTick } from "vue";
import anime from "animejs";
import client from "@/store/sanity.js";
import LongImages from "@/components/blog/LongImages.vue";

const games = ref([
  {
    url: new URL("@/assets/images/gaming/lis.jpg", import.meta.url).toString(),
    caption:
      "I always recommend Life is Strange to someone who wants to start out with games.",
  },
  {
    url: new URL(
      "@/assets/images/gaming/hitman3.jpg",
      import.meta.url,
    ).toString(),
    caption:
      "I was never a fan of the earlier hitman games, but this trilogy has to be one of the best stealth series I've played.",
  },
  {
    url: new URL(
      "@/assets/images/gaming/spiderman.jpg",
      import.meta.url,
    ).toString(),
    caption:
      "100% plat on the PS4, PS5, and Spider-Man 2 as well. I really wish SM2 lived up to the hype. Would have replaced this tile here.",
  },
  {
    url: new URL(
      "@/assets/images/gaming/budokai.jpg",
      import.meta.url,
    ).toString(),
    caption: "This defined summer vacations for my brother and I.",
  },
  {
    url: new URL(
      "@/assets/images/gaming/arkham.jpg",
      import.meta.url,
    ).toString(),
    caption:
      "I can't remember if this or Splinter Cell: Conviction was my introduction to stealth. Probably this one since I was such a Batman nerd.",
  },
  {
    url: new URL("@/assets/images/gaming/valo.jpg", import.meta.url).toString(),
    caption:
      "It's the one game that I'm not great at, but I love playing. There's always the one.",
  },
]);
const loading = ref(true);

onMounted(async () => {
  const W1 = document.createElement("script");
  W1.src = "https://fast.wistia.net/assets/external/E-v1.js";
  W1.async = true;
  W1.defer = true;
  document.body.appendChild(W1);

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

  anime({
    targets: [".anime-entry, h1, h2, h3, p, span"],
    translateY: ["1rem", "0"],
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
  <h1>Stack: PC + Console</h1>
  <p>
    I built my PC back in 2014, and its due for an upgrade any minute now. It's
    kept me company from the likes of Batman: Arkham Asylum, Splinter Cell:
    Blacklist, and although sluggishly, even up to Hitman 3 and Watch Dogs 2.
    For games after 2022, I have my PS5.
  </p>
  <div class="grid grid-cols-6 grid-rows-1 gap-4">
    <img
      src="@/assets/images/pc/pc.jpeg"
      alt="pc setup"
      title="This picture was taken before I got my playstation, but it's here in spirit."
      class="anime-entry col-span-6 row-span-2 cursor-help rounded-2xl border border-white/15 bg-black lg:col-span-5"
    />
    <div
      class="col-span-1 hidden grid-cols-1 grid-rows-5 content-start gap-4 lg:grid"
    >
      <img
        src="@/assets/images/pc/intel.png"
        alt="Intel Core i5-4670 @3.4GHz Quad-Core"
        title="Intel Core i5-4670 @3.4GHz Quad-Core"
        class="card anime-entry col-span-1 row-span-1 aspect-square cursor-help rounded-3xl object-scale-down p-4"
      />
      <img
        src="@/assets/images/pc/nvidia.png"
        alt="Zotac GeForce GTX 1060 3GB"
        title="Zotac GeForce GTX 1060 3GB"
        class="card anime-entry col-span-1 row-span-1 aspect-square cursor-help rounded-3xl object-scale-down p-4"
      />
      <img
        src="@/assets/images/pc/corsair.png"
        alt="Corsair Graphite Series 230T ATX Mid Tower"
        title="Corsair Graphite Series 230T ATX Mid Tower"
        class="card anime-entry col-span-1 row-span-1 aspect-square cursor-help rounded-3xl object-scale-down p-4"
      />
      <img
        src="@/assets/images/pc/gigabyte.png"
        alt="Gigabyte GA-B85M-D3H Micro-ATX LGA1150"
        title="Gigabyte GA-B85M-D3H Micro-ATX LGA1150"
        class="card anime-entry col-span-1 row-span-1 aspect-square cursor-help rounded-3xl object-scale-down p-4"
      />
      <img
        src="@/assets/images/pc/ps.png"
        alt="Sony PlayStation 5"
        title="Sony PlayStation 5"
        class="card anime-entry col-span-1 row-span-1 aspect-square h-full w-full cursor-help rounded-3xl object-scale-down p-4"
      />
    </div>
  </div>
  <p class="caption">
    My best estimate of total hours played in life: 13,000h+
  </p>
  <!-- 5 to 10, avg 2.5hrs/week + 10 to 15 avg 0.5hrs/weekday and 3hrs/weekend + 16 and 17, avg 3-5hrs/day + 18 to 27 avg 0.5hrs/weekday and 3-5hrs/weekend-->
  <!-- 650 + 2,210 + 2,184–3,640 + 4,420–6,500-->
  <!-- 9,464 to 13,000 -->
  <h1>Valorant Gameplay Montage</h1>
  <p>
    I always wanted to create some sort of a gameplay montage, and had been
    recording these for a while. Had some time today so I fired up iMovie and
    picked a song from my recents in Spotify.
  </p>
  <div class="anime-entry aspect-video overflow-hidden rounded-lg bg-black">
    <div
      class="wistia_responsive_padding"
      style="padding: 56.25% 0 0 0; position: relative"
    >
      <div
        class="wistia_responsive_wrapper"
        style="height: 100%; left: 0; position: absolute; top: 0; width: 100%"
      >
        <iframe
          src="https://fast.wistia.net/embed/iframe/ybn9loazpr?seo=false&videoFoam=true"
          title="Valorant Reel"
          allow="autoplay; fullscreen"
          allowtransparency="true"
          frameborder="0"
          scrolling="no"
          class="wistia_embed"
          name="wistia_embed"
          msallowfullscreen
          width="100%"
          height="100%"
        ></iframe>
      </div>
    </div>
  </div>
  <p class="anime-entry caption">
    Video editing is difficult but it's easier than ranking higher in Valorant
    :')
  </p>
  <h1>All-time favorites</h1>
  <div class="grid grid-cols-3 gap-4 sm:grid-cols-3">
    <div
      :class="[
        'anime-entry group/image relative aspect-square overflow-hidden rounded-lg',
      ]"
      v-for="(game, i) in games"
      :key="i"
    >
      <img
        class="h-full w-full cursor-help select-none"
        v-lazy="game.url"
        :alt="game.caption"
        :title="game.caption"
      />
    </div>
  </div>
</template>
