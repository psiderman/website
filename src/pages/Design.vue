<script setup>
import QuizizzCard from "@/components/design/QuizizzCard.vue";
import DesignCard from "@/components/design/DesignCard.vue";
import { RouterLink, useRouter } from "vue-router";
import { ref, onMounted, nextTick, markRaw } from "vue";
import anime from "animejs";
import _ from "lodash";

const router = useRouter();

const shotData = [
  {
    type: "image",
    link: "https://links.psiderman.com/question-type-case-study",
    title: "Question Types Case Study",
    year: "2022–2023",
    src: new URL("@/assets/design/shots/qt.png", import.meta.url).toString(),
  },
  {
    type: "component",
    link: "/design/quizizz/",
    aspect: "aspect-shot",
    component: markRaw(QuizizzCard),
    title: "Quizizz Inc.",
    year: "2019–2023",
  },
  {
    type: "image",
    link: "https://links.psiderman.com/design-system-case-study",
    title: "Design System Case Study",
    year: "2020–2023",
    src: new URL("@/assets/design/shots/ds.png", import.meta.url).toString(),
  },
  {
    type: "video",
    link: false,
    title: "Skeumorphic Button",
    year: "January 2024",
    src: new URL(
      "@/assets/design/shots/button.mp4",
      import.meta.url,
    ).toString(),
  },
  {
    type: "video",
    link: false,
    aspect: "aspect-shot",
    title: "Graphing in-Product Education",
    year: "2023",
    src: new URL(
      "@/assets/design/shots/graphing.mp4",
      import.meta.url,
    ).toString(),
  },
  {
    type: "video",
    link: "https://codepen.io/psiderman/pen/KKevazx",
    title: "Math Input",
    year: "2023",
    src: new URL("@/assets/design/shots/calc.mp4", import.meta.url).toString(),
  },
  {
    type: "video",
    link: "https://codepen.io/psiderman/pen/xxbNeXj",
    aspect: "aspect-shot",
    title: "Mystery Box Animation",
    year: "2021",
    src: new URL("@/assets/design/shots/mbox.mp4", import.meta.url).toString(),
  },
  {
    type: "video",
    link: "https://owensans.vercel.app/",
    title: "Owen Sans",
    year: "Feb 2023",
    src: new URL(
      "@/assets/design/shots/owensans.mp4",
      import.meta.url,
    ).toString(),
  },
  {
    type: "image",
    link: false,
    title: "Graphing Question Type",
    year: "2023",
    src: new URL(
      "@/assets/design/shots/graphing.png",
      import.meta.url,
    ).toString(),
  },
  {
    type: "video",
    link: false,
    title: "Live Whiteboard Education",
    year: "2021",
    src: new URL("@/assets/design/shots/live.mp4", import.meta.url).toString(),
  },
  {
    type: "video",
    link: "https://links.psiderman.com/primer",
    title: "Primer to Personal Finance",
    year: "2022",
    src: new URL(
      "@/assets/design/shots/primer-2.mp4",
      import.meta.url,
    ).toString(),
  },
  {
    type: "video",
    link: "https://kiwi.psiderman.com",
    title: "Kiwi Personal Finance",
    year: "2023",
    src: new URL("@/assets/design/shots/kiwi.mp4", import.meta.url).toString(),
  },
  {
    type: "video",
    link: false,
    title: "Spin the Wheel Education",
    year: "2021",
    src: new URL("@/assets/design/shots/spin.mp4", import.meta.url).toString(),
  },
  {
    type: "image",
    link: false,
    aspect: "aspect-square",
    title: "Cmd + F*ck off Laptop Stickers",
    year: "2023",
    src: new URL("@/assets/design/shots/cmd.png", import.meta.url).toString(),
  },
  {
    type: "video",
    link: false,
    title: "Old Portfolio",
    year: "2022",
    src: new URL(
      "@/assets/design/shots/psiderman.com.mp4",
      import.meta.url,
    ).toString(),
  },
];

function navigateLink(link) {
  if (!link) return;
  if (link.startsWith("/")) router.push(link);
  else window.open(link, "_blank");
}

const gridCols = ref(0);
const gridItems = ref([]);

function transformData(cols) {
  gridCols.value = cols;
  gridItems.value = Array.from({ length: cols }, () => []);
  for (let i = 0; i < shotData.length; i++)
    gridItems.value[i % gridCols.value].push(shotData[i]);
}

function calculateCols() {
  const oldValue = gridCols.value;
  let newValue;

  if (window.innerWidth > 1024) newValue = 3;
  else if (window.innerWidth >= 639) newValue = 2;
  else newValue = 1;

  if (newValue !== oldValue) transformData(newValue);
}

const debouncedCalculateCols = _.debounce(calculateCols, 50);

onMounted(() => {
  calculateCols();
  nextTick(() => {
    const animation = anime.timeline();
    animation
      .add({
        targets: [".anime-entry"],
        translateY: ["1rem", "0"],
        opacity: [0, 1],
        scale: [0.95, 1],
        transformOrigin: "center",
        duration: 500,
        easing: "easeOutBack",
        delay: anime.stagger(100),
      })
      .add({
        targets: [".design-card"],
        translateY: ["1rem", "0"],
        opacity: [0, 1],
        scale: [0.95, 1],
        transformOrigin: "center",
        duration: 500,
        easing: "easeOutBack",
        delay: anime.stagger(100, {
          grid: [gridItems.value[1].length, gridItems.value.length],
        }),
      })
      .add({
        targets: [".footer-anime-entry"],
        translateY: ["1rem", "0"],
        opacity: [0, 1],
        scale: [0.95, 1],
        transformOrigin: "center",
        duration: 500,
        easing: "easeOutBack",
        delay: anime.stagger(100),
      });
  });
  window.addEventListener("resize", debouncedCalculateCols);
});
</script>
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
      class="mx-auto mb-20 mt-10 flex max-w-2xl flex-col items-center justify-center gap-4 px-10"
    >
      <h1 class="anime-entry text-4xl font-semibold text-white">
        Design Portfolio
      </h1>
      <p class="anime-entry text-center text-base text-white/80">
        Most recently, I was a senior product designer at Quizizz Inc. where I
        delivered countless quality of life enhancements across core product
        experiences, revenue, and growth, while leading the Design Systems and
        Content Platform teams.
      </p>
    </div>

    <!-- Grid -->
    <div
      class="mx-auto grid w-screen max-w-screen-xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div class="flex flex-col gap-4" v-for="(col, i) in gridItems" :key="i">
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
              class="shot"
              :src="shot.src"
              :alt="shot.title"
            />
            <component
              v-else-if="shot.type == 'component'"
              :is="shot.component"
            ></component>
            <img
              v-if="shot.link"
              src="@/assets/duotone/external-link.svg"
              alt="link"
              class="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/50 px-1.5"
            />
          </DesignCard>
        </template>
      </div>
    </div>

    <div
      class="mt-20 flex w-full select-none flex-col items-center justify-center gap-y-1 text-center text-base text-white/50"
    >
      <span class="footer-anime-entry">
        ©️ Karan Sanas {{ new Date().getFullYear() }}
      </span>
      <span class="footer-anime-entry"
        >Handcrafted in Figma + Vue.js, with love.</span
      >
    </div>
    <div class="w640 mt-8 flex flex-row flex-wrap justify-center text-white/50">
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
        href="https://psiderman.read.cv"
        target="_blank"
        class="footer-anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Read.cv</a
      >
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.grid img.shot,
.grid video.shot {
  @apply h-full w-full object-contain;
}

.grid .design-card {
  @apply h-min grow-0;
}
</style>
