<script setup>
import { onMounted, ref } from "vue";
import anime from "animejs";

onMounted(async () => {
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
  <h1 class="mb-4">
    What am I doing
    <a
      href="https://nownownow.com/about"
      target="_blank"
      class="underline underline-offset-2"
    >
      now</a
    >
    ?
  </h1>
  <p class="italic">Last updated: October 2024</p>
  <ul>
    <li>
      I’ve recently taken up a new role at
      <a
        href="https://www.usemultiplier.com/"
        target="_blank"
        class="underline underline-offset-2"
        >Multiplier</a
      >, an employment platform that allows teams to hire employees
      internationally.
    </li>
    <li>
      I've moved back to Bangalore, set up a home base here while I continue to
      explore the world slowly, one city at a time.
    </li>
    <li>
      As of today, I'm savoring the daily tedium but keeping an eye out for
      something that could pique my interest and inspire me to set a new goal.
    </li>
  </ul>
</template>
