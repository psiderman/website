<script setup>
import { onMounted } from "vue";
import anime from "animejs";

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
    I joined as Quizizz’s second designer, and worked with the team from 2019 to
    2023. I delivered countless quality of life enhancements, and below are some
    of the bigger projects I spearheaded, while leading the Design Systems, and
    Content Platform teams.
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
      <img
        class="anime-entry gallery-image"
        src="@/assets/design/qtcs/02.png"
      />
      <img
        class="anime-entry gallery-image"
        src="@/assets/design/qtcs/03.png"
      />
      <img
        class="anime-entry gallery-image"
        src="@/assets/design/qtcs/04.png"
      />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <div class="flex w-full flex-row justify-between">
    <p class="caption anime-entry">A sneak peek of the case study</p>
  </div>

  <!-- Motion -->
  <h2>Motion and Interaction</h2>
  <p>
    In addition to delivering screens and flows, I often took to Codepen,
    Principle, and plain old Figma to create additional artifacts. More often
    than not, these artifacts made it into the product as MP4s or GIFs. These
    small things will likely outlive the other work I've done.
  </p>
  <div
    class="large grid grid-cols-2 grid-rows-2 gap-4 lg:grid-cols-4 lg:gap-10"
  >
    <div class="motion-card anime-entry col-span-2 row-span-2 p-4">
      <video
        src="@/assets/design/motion/graphing.mp4"
        autoplay
        playsinline
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/spin.mp4"
        autoplay
        playsinline
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/calc.mp4"
        autoplay
        playsinline
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/mbox.mp4"
        autoplay
        playsinline
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/live.mp4"
        autoplay
        playsinline
        muted
        loop
      ></video>
    </div>
  </div>

  <!-- Design System -->

  <h2>Design System</h2>
  <p>
    I created and maintained three iterations of the design system in Figma+Code
    to be used by 16 designers and 50+ engineers.
  </p>
  <div class="aspect-video">
    <div class="gallery-scroll">
      <div class="gallery-spacer"></div>
      <img class="anime-entry gallery-image" src="@/assets/design/ds/01.png" />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption anime-entry">
    I'm putting together a case study for this rn...
  </p>

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
      <img
        class="anime-entry gallery-image"
        src="@/assets/design/lessons/01.png"
      />
      <img
        class="anime-entry gallery-image"
        src="@/assets/design/lessons/02.png"
      />
      <img
        class="anime-entry gallery-image"
        src="@/assets/design/lessons/03.png"
      />
      <img
        class="anime-entry gallery-image"
        src="@/assets/design/lessons/04.gif"
      />
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
  @apply w-full max-w-screen-sm shrink-0 select-none rounded-sm border border-white/15 bg-black;
}
</style>
