<script setup>
import { ref, onMounted, nextTick } from "vue";
import anime from "animejs";
import client from "@/store/sanity.js";
import LongImages from "@/components/blog/LongImages.vue";

const data = ref(null);
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
  try {
    const query = '*[_type == "games"]';
    const response = await client.fetch(query);
    data.value = response;
    nextTick(() => {
      loading.value = false;
      anime({
        targets: [
          ".sanity .anime-entry, .sanity h1, .sanity h2, .sanity h3, .sanity p, .sanity ul, .sanity li, .sanity span",
        ],
        translateY: ["1rem", "0"],
        opacity: [0, 1],
        scale: [0.95, 1],
        transformOrigin: "center",
        duration: 500,
        easing: "easeOutBack",
        delay: anime.stagger(100),
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
</script>

<template>
  <h1>Stack: PC + Console</h1>
  <p>
    I built my PC back in 2014, and its due for an upgrade any minute now. It's
    kept me company from the likes of Batman: Arkham Asylum, Splinter Cell:
    Blacklist, and although sluggishly, even up to Hitman 3 and Watch Dogs 2.
  </p>
  <div class="grid grid-cols-6 grid-rows-1 gap-4">
    <img
      src="@/assets/images/pc.jpeg"
      alt="pc setup"
      title="This picture was taken before I got my playstation, but it's here in spirit."
      class="anime-entry col-span-5 row-span-2 cursor-help rounded-2xl border border-white/15 bg-black"
    />
    <div class="col-span-1 grid grid-cols-1 grid-rows-5 content-start gap-4">
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
    recording these for a while and had some time today, so I fired up iMovie
    and picked a song from my recents in Spotify.
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
    Video editing, is difficult, but easier than ranking higher in Valorant :')
  </p>
  <div v-if="loading">
    <div class="w640">
      <div
        class="anime-entry skeleton-shimmer mb-8 mt-16 h-8 w-64 overflow-hidden rounded-lg bg-white/5"
      ></div>
      <div
        class="anime-entry skeleton-shimmer my-8 h-16 w-full overflow-hidden rounded-lg bg-white/5"
      ></div>
    </div>
    <LongImages
      :skeleton="true"
      :square="true"
      :images="[
        { id: 1, asset: { _ref: '' } },
        { id: 2, asset: { _ref: '' } },
        { id: 3, asset: { _ref: '' } },
        { id: 4, asset: { _ref: '' } },
      ]"
    />
  </div>
  <div class="sanity">
    <template v-for="(game, i) in data" :key="i">
      <h1>{{ game.category }}</h1>
      <LongImages :images="game.images" :square="true" />
    </template>
  </div>
</template>
