<script setup>
import { onMounted } from "vue";
import anime from "animejs";

const imageData = {
  qtcs: {
    i: new URL("@/assets/design/qtcs/02.png", import.meta.url).toString(),
    ii: new URL("@/assets/design/qtcs/03.png", import.meta.url).toString(),
    iii: new URL("@/assets/design/qtcs/04.png", import.meta.url).toString(),
    iv: new URL("@/assets/design/qtcs/05.png", import.meta.url).toString(),
  },
  ds: {
    i: new URL("@/assets/design/ds/01.png", import.meta.url).toString(),
    ii: new URL("@/assets/design/ds/02.png", import.meta.url).toString(),
    iii: new URL("@/assets/design/ds/03.png", import.meta.url).toString(),
  },
  lessons: {
    i: new URL("@/assets/design/lessons/01.png", import.meta.url).toString(),
    ii: new URL("@/assets/design/lessons/02.png", import.meta.url).toString(),
    iii: new URL("@/assets/design/lessons/03.png", import.meta.url).toString(),
    iv: new URL("@/assets/design/lessons/04.gif", import.meta.url).toString(),
  },
};

onMounted(() => {
  anime({
    targets: [".anime-entry, h1, h2, h3, p, ul, li, span"],
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
  <div class="w640 anime-entry mb-6">
    <img
      src="@/assets/svg/quizizz.svg"
      alt="Quizizz Logo"
      class="-ml-2 h-10 w-[120px]"
    />
    <h1 class="hidden">Quizizz</h1>
  </div>
  <p>
    Quizizz is an online platform that helps teachers conduct assessments,
    instruction, and practice that motivate every student. It’s used by 80
    million+ educators and students around the world.
  </p>
  <p>
    I joined the team as the second ever designer at Quizizz, a high-growth
    startup that helps teachers and students to teach and learn better, where we
    scaled from 18M MAU to 80M MAU during my time there.
  </p>
  <p>
    I've also contributed to growing the design team from 2 to 20 and shaping
    its culture and rituals, including critical contributions such as using
    Harry Potter references instead of Lorem Ipsum in Figma files.
  </p>

  <!-- Question types -->
  <h2>Question Types</h2>
  <p>
    At the time of writing this, there are sixteen ways to ask a question on
    Quizizz. Between 2021 and 2023, we added 12 new question types, of which I
    designed 9, and led the designs for 3 more.
  </p>

  <div class="aspect-video">
    <div class="gallery-scroll">
      <div class="gallery-spacer"></div>
      <img class="anime-entry gallery-image" v-lazy="imageData.qtcs.i" />
      <img class="anime-entry gallery-image" v-lazy="imageData.qtcs.ii" />
      <img class="anime-entry gallery-image" v-lazy="imageData.qtcs.iii" />
      <img class="anime-entry gallery-image" v-lazy="imageData.qtcs.iv" />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption anime-entry">A sneak peek of the case study</p>

  <!-- Design System -->

  <h2>Design System</h2>
  <p>
    I created and maintained three iterations of the design system in Figma+Code
    to be used by 16 designers and 50+ engineers. Here's an old
    <a
      class="underline underline-offset-4"
      href="https://psiderman.notion.site/Handbook-Deprecated-881cfca7ed1344f9935c77afb0531c14?pvs=74"
      target="_blank"
      >documentation</a
    >
    that I maintained here.
  </p>
  <div class="aspect-video">
    <div class="gallery-scroll">
      <div class="gallery-spacer"></div>
      <img class="anime-entry gallery-image" v-lazy="imageData.ds.i" />
      <img class="anime-entry gallery-image" v-lazy="imageData.ds.ii" />
      <img class="anime-entry gallery-image" v-lazy="imageData.ds.iii" />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption anime-entry">A sneak peek of the case study</p>

  <!-- Other -->
  <h2>Lessons, and other projects</h2>
  <p>
    These are all archived projects from the earlier iterations of my portfolio.
    I’ve since moved them out to read.cv just because I wasn’t keen on hosting a
    website archive. You can read all of them here.
  </p>
  <div class="aspect-video">
    <div class="gallery-scroll">
      <div class="gallery-spacer"></div>
      <img class="anime-entry gallery-image" v-lazy="imageData.lessons.i" />
      <img class="anime-entry gallery-image" v-lazy="imageData.lessons.ii" />
      <img class="anime-entry gallery-image" v-lazy="imageData.lessons.iii" />
      <img class="anime-entry gallery-image" v-lazy="imageData.lessons.iv" />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption">
    The only two designers of Quizizz at the time delivered this 0→1 product in
    under four weeks.
  </p>

  <div class="w640 mt-10 flex flex-col gap-y-2">
    <div class="flex flex-row items-center gap-x-2">
      <a
        href="https://psiderman.read.cv/quizizz-lessons"
        target="_blank"
        class="anime-entry shrink-0 font-serif text-lg leading-8 text-white/80 underline underline-offset-4"
      >
        Lessons
      </a>
      <span class="shrink-0 font-serif text-lg leading-8 text-white/50"
        >Designer</span
      >
      <div class="anime-entry h-px w-full grow bg-white/10"></div>
      <span
        class="shrink-0 text-right font-serif text-lg leading-8 text-white/50"
        >2020</span
      >
    </div>
    <div class="flex flex-row items-center gap-x-2">
      <a
        href="https://psiderman.read.cv/quizizz-parent-reports"
        target="_blank"
        class="anime-entry shrink-0 font-serif text-lg leading-8 text-white/80 underline underline-offset-4"
      >
        Parent Reports v2
      </a>
      <span class="shrink-0 font-serif text-lg leading-8 text-white/50"
        >Lead Designer</span
      >
      <div class="anime-entry h-px w-full grow bg-white/10"></div>
      <span
        class="shrink-0 text-right font-serif text-lg leading-8 text-white/50"
        >2020</span
      >
    </div>
    <div class="flex flex-row items-center gap-x-2">
      <a
        href="https://psiderman.read.cv/quizizz-other"
        target="_blank"
        class="anime-entry shrink-0 font-serif text-lg leading-8 text-white/80 underline underline-offset-4"
      >
        Miscellaneous Projects
      </a>
      <span class="shrink-0 font-serif text-lg leading-8 text-white/50"
        >Designer</span
      >
      <div class="anime-entry h-px w-full grow bg-white/10"></div>
      <span
        class="shrink-0 text-right font-serif text-lg leading-8 text-white/50"
        >2019 – 2020</span
      >
    </div>
  </div>

  <!-- Work/Play -->
  <h2>Bonus BTS: Work and Play</h2>
  <div class="aspect-video">
    <div class="gallery-scroll">
      <div class="gallery-spacer"></div>
      <video
        class="w640 anime-entry aspect-video rounded-sm border border-white/15 bg-black"
        autoplay
        src="@/assets/design/work.mp4"
        playsinline
        muted
        loop
      ></video>
      <video
        class="w640 anime-entry aspect-video rounded-sm border border-white/15 bg-black"
        autoplay
        src="@/assets/design/qudeez.mp4"
        playsinline
        muted
        loop
      ></video>
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption anime-entry">
    Did you know? 'qudeez' is a portmanteau of Quizizz Design Cuties. Being a
    qudee is the second highest honor after OP.
  </p>
</template>

<style lang="postcss" scoped>
.motion-card {
  @apply pointer-events-none aspect-square overflow-hidden rounded-3xl border border-white/15 bg-black;
}

.motion-card video {
  @apply h-full w-full object-contain;
}

.gallery-scroll {
  @apply absolute left-0 flex flex-row gap-4 overflow-auto overscroll-x-none px-4;
  width: calc(100dvw - 16px);
}

.gallery-spacer {
  @apply h-full shrink-0;
  width: calc((100dvw - 640px) / 2 - 32px);
}

.gallery-scroll img.gallery-image {
  @apply aspect-video w-full max-w-screen-sm shrink-0 select-none rounded-sm border border-white/15 bg-black;
}
</style>
