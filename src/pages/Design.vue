<template>
  <div class="mx-auto min-h-dvh w-screen max-w-screen-xl px-0 py-20">
    <RouterLink to="/">
      <img
        src="@/assets/svg/psider.svg"
        alt="logo"
        class="anime-entry mx-auto mb-20 select-none"
      />
    </RouterLink>
    <div
      class="mx-auto mt-10 mb-20 flex max-w-2xl flex-col items-center justify-center gap-4 px-10"
    >
      <h1 class="anime-entry text-center text-4xl font-semibold text-white">
        Design Portfolio
      </h1>
      <p class="anime-entry text-center text-base text-white/80">
        Most recently, I was a senior product designer at Dezerv (Accel-backed,
        $2Bn AUM) where I led the first ever desktop investor experience and
        introduced Prosper, the design system that unifies design foundations
        across 3 investor products and 1 internal tool.
      </p>
    </div>

    <!-- Grid -->
    <div
      class="mx-auto grid w-screen max-w-screen-xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="(col, i) in gridItems" :key="i" class="flex flex-col gap-4">
        <template v-for="(shot, j) in col" :key="j">
          <DesignCard
            :title="shot.title"
            :year="shot.year"
            :class="[
              shot.aspect ? shot.aspect : '',
              shot.link ? 'cursor-pointer' : '',
            ]"
            @click="navigateLink(shot.link)"
          >
            <video
              v-if="shot.type == 'video'"
              :src="shot.src"
              class="shot"
              autoplay
              playsinline
              muted
              loop
            ></video>
            <img
              v-else-if="shot.type == 'image'"
              v-lazy="shot.src"
              class="shot"
              :alt="shot.title"
            />
            <component
              :is="shot.component"
              v-else-if="shot.type == 'component'"
            ></component>
            <img
              v-if="shot.link"
              src="@/assets/duotone/external-link.svg"
              alt="link"
              class="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 px-1.5"
            />
          </DesignCard>
        </template>
      </div>
    </div>

    <div
      class="mt-20 flex w-full flex-col items-center justify-center gap-y-1 text-center text-base text-white/50 select-none"
    >
      <span class="footer-anime-entry">
        ©️ Karan Sanas {{ new Date().getFullYear() }}
      </span>
      <span class="footer-anime-entry"
        >Handcrafted with Figma, Vue.js, no AI content, and&nbsp;&nbsp;<fa
          :class="[heartFill ? 'text-red-500' : '', 'cursor-pointer']"
          :icon="[heartFill ? 'fas' : 'far', 'heart']"
          @click="fillHeart"
        />
      </span>
    </div>
    <div
      class="w640 mt-8 flex flex-row flex-wrap justify-center text-white/50 select-none"
    >
      <RouterLink
        to="/"
        class="footer-anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Home</RouterLink
      >
      <a
        href="https://twitter.com/_psiderman_"
        target="_blank"
        class="footer-anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Twitter</a
      >
      <a
        href="/Karan Sanas Product Designer.pdf"
        target="_blank"
        class="footer-anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Resume</a
      >
      <a
        href="https://github.com/psiderman/website"
        target="_blank"
        class="footer-anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Github</a
      >
      <a
        href="https://www.linkedin.com/in/psiderman/"
        target="_blank"
        class="footer-anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >LinkedIn</a
      >
    </div>
  </div>
</template>

<script setup>
import anime from "animejs";
import _ from "lodash";
import { markRaw, nextTick, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import DesignCard from "@/components/design/DesignCard.vue";
import QuizizzCard from "@/components/design/QuizizzCard.vue";

import DezervCard from "../components/design/DezervCard.vue";

const router = useRouter();

const heartFill = ref(false);

function fillHeart() {
  heartFill.value = !heartFill.value;
}

const shotData = [
  {
    aspect: "aspect-shot spotlight",
    component: markRaw(DezervCard),
    link: "/design/dezerv/",
    title: "Senior Product Designer",
    type: "component",
    year: "Feb–Dec 2025",
  },
  {
    link: "https://links.psiderman.com/question-type-case-study",
    src: new URL("@/assets/design/shots/qt.png", import.meta.url).toString(),
    title: "Question Types Case Study",
    type: "image",
    year: "2022–2023",
  },
  {
    aspect: "aspect-shot spotlight",
    component: markRaw(QuizizzCard),
    link: "/design/quizizz/",
    title: "Senior Product Designer",
    type: "component",
    year: "2019–2023",
  },
  {
    link: "https://links.psiderman.com/design-system-case-study",
    src: new URL("@/assets/design/shots/ds.png", import.meta.url).toString(),
    title: "Design System Case Study",
    type: "image",
    year: "2020–2023",
  },
  {
    link: false,
    src: new URL(
      "@/assets/design/shots/button.mp4",
      import.meta.url,
    ).toString(),
    title: "Skeumorphic Button",
    type: "video",
    year: "January 2024",
  },
  {
    aspect: "aspect-shot",
    link: false,
    src: new URL(
      "@/assets/design/shots/graphing.mp4",
      import.meta.url,
    ).toString(),
    title: "Graphing in-Product Education",
    type: "video",
    year: "2023",
  },
  {
    link: "https://codepen.io/psiderman/pen/KKevazx",
    src: new URL("@/assets/design/shots/calc.mp4", import.meta.url).toString(),
    title: "Math Input",
    type: "video",
    year: "2023",
  },
  {
    aspect: "aspect-shot",
    link: "https://codepen.io/psiderman/pen/xxbNeXj",
    src: new URL("@/assets/design/shots/mbox.mp4", import.meta.url).toString(),
    title: "Mystery Box Animation",
    type: "video",
    year: "2021",
  },
  {
    link: "https://owensans.vercel.app/",
    src: new URL(
      "@/assets/design/shots/owensans.mp4",
      import.meta.url,
    ).toString(),
    title: "Owen Sans",
    type: "video",
    year: "Feb 2023",
  },
  {
    link: false,
    src: new URL(
      "@/assets/design/shots/graphing.png",
      import.meta.url,
    ).toString(),
    title: "Graphing Question Type",
    type: "image",
    year: "2023",
  },
  {
    link: false,
    src: new URL("@/assets/design/shots/live.mp4", import.meta.url).toString(),
    title: "Live Whiteboard Education",
    type: "video",
    year: "2021",
  },
  {
    link: "https://links.psiderman.com/primer",
    src: new URL(
      "@/assets/design/shots/primer-2.mp4",
      import.meta.url,
    ).toString(),
    title: "Primer to Personal Finance",
    type: "video",
    year: "2022",
  },
  {
    src: new URL("@/assets/design/shots/kiwi.mp4", import.meta.url).toString(),
    // link: "https://kiwi.psiderman.com",
    title: "Kiwi Personal Finance",
    type: "video",
    year: "2023",
  },
  {
    link: false,
    src: new URL("@/assets/design/shots/spin.mp4", import.meta.url).toString(),
    title: "Spin the Wheel Education",
    type: "video",
    year: "2021",
  },
  {
    aspect: "aspect-square",
    link: false,
    src: new URL("@/assets/design/shots/cmd.png", import.meta.url).toString(),
    title: "Cmd + F*ck off Laptop Stickers",
    type: "image",
    year: "2023",
  },
  {
    link: false,
    src: new URL(
      "@/assets/design/shots/psiderman.com.mp4",
      import.meta.url,
    ).toString(),
    title: "Old Portfolio",
    type: "video",
    year: "2022",
  },
];

function navigateLink(link) {
  if (!link) return;
  if (link.startsWith("/")) router.push(link);
  else window.open(link, "_blank");
}

const gridCols = ref(0);
const gridItems = ref([]);

function calculateCols() {
  const oldValue = gridCols.value;
  let newValue;

  if (window.innerWidth > 1024) newValue = 3;
  else if (window.innerWidth >= 639) newValue = 2;
  else newValue = 1;

  if (newValue !== oldValue) transformData(newValue);
}

function transformData(cols) {
  gridCols.value = cols;
  gridItems.value = Array.from({ length: cols }, () => []);
  for (let i = 0; i < shotData.length; i++)
    gridItems.value[i % gridCols.value].push(shotData[i]);
}

const debouncedCalculateCols = _.debounce(calculateCols, 50);

onMounted(() => {
  calculateCols();
  nextTick(() => {
    const animation = anime.timeline();
    animation
      .add({
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutBack",
        opacity: [0, 1],
        scale: [0.95, 1],
        targets: [".anime-entry"],
        transformOrigin: "center",
        translateY: ["1rem", "0"],
      })
      .add({
        delay: anime.stagger(100, {
          grid: [gridItems.value[0].length, gridItems.value.length],
        }),
        duration: 500,
        easing: "easeOutBack",
        opacity: [0, 1],
        scale: [0.95, 1],
        targets: [".design-card"],
        transformOrigin: "center",
        translateY: ["1rem", "0"],
      })
      .add({
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutBack",
        opacity: [0, 1],
        scale: [0.95, 1],
        targets: [".footer-anime-entry"],
        transformOrigin: "center",
        translateY: ["1rem", "0"],
      });

    const spotlights = document.querySelectorAll(".spotlight");

    spotlights.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gradient = `radial-gradient(circle at ${x}px ${y}px, hsla(0, 0%, 0%, 5%) 0%, hsla(0, 0%, 0%, 100%) 80%)`;
        card.style.setProperty("background", gradient);
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("background", "hsla(0,0%,0%,100%)");
      });
    });
  });
  window.addEventListener("resize", debouncedCalculateCols);
});
</script>

<style  scoped>
@reference "tailwindcss";
.grid img.shot,
.grid video.shot {
  @apply h-full w-full object-contain;
}

.grid .design-card {
  @apply h-min grow-0;
}
</style>
