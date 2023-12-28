<script setup></script>
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
      <img class="anime-entry" src="@/assets/design/qtcs/01.png" />
      <img class="anime-entry" src="@/assets/design/qtcs/02.png" />
      <img class="anime-entry" src="@/assets/design/qtcs/03.png" />
      <img class="anime-entry" src="@/assets/design/qtcs/04.png" />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption anime-entry">A sneak peek of the case study</p>

  <!-- Lessons -->
  <!-- <h2>Lessons, 2020</h2>
  <p>
    What happens when you take informational slides and marry them with the
    interactivity of a quiz game? You kill ‘death by slides’. The sole two
    designers of Quizizz at the time delivered this 0→1 product in under four
    weeks.
  </p>
  <div class="aspect-video">
    <div class="gallery-scroll">
      <div class="gallery-spacer"></div>
      <img class="anime-entry" src="@/assets/design/lessons/01.png" />
      <img class="anime-entry" src="@/assets/design/lessons/02.png" />
      <img class="anime-entry" src="@/assets/design/lessons/03.png" />
      <img class="anime-entry" src="@/assets/design/lessons/04.gif" />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption">
    You can read more about this project
    <a
      href="https://psiderman.read.cv/quizizz-lessons"
      target="_blank"
      class="underline"
      >here</a
    >
  </p> -->

  <!-- Motion -->
  <h2>Motion and Interaction</h2>
  <p>
    In addition to delivering screens and flows, I often took to Codepen,
    Principle, and plain old Figma to create additional artifacts. More often
    than not, these artifacts made it into the product as MP4s or GIFs. These
    small things will likely outlive the other work I've done.
  </p>
  <div class="large grid grid-cols-4 grid-rows-2 gap-10">
    <div class="motion-card anime-entry col-span-2 row-span-2 p-4">
      <video
        src="@/assets/design/motion/graphing.mp4"
        class="h-full w-full object-contain"
        autoplay
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/spin.mp4"
        class="h-full w-full object-contain"
        autoplay
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/calc.mp4"
        class="h-full w-full object-contain"
        autoplay
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/mbox.mp4"
        class="h-full w-full object-contain"
        autoplay
        muted
        loop
      ></video>
    </div>
    <div class="motion-card anime-entry">
      <video
        src="@/assets/design/motion/live.mp4"
        class="h-full w-full object-contain"
        autoplay
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
      <img class="anime-entry" src="@/assets/design/ds/01.png" />
      <div class="gallery-spacer"></div>
    </div>
  </div>
  <p class="caption anime-entry">
    I'm putting together a case study for this rn...
  </p>
</template>

<style lang="postcss" scoped>
.motion-card {
  @apply pointer-events-none aspect-square overflow-hidden rounded-3xl border border-white/15 bg-black;
}
</style>
