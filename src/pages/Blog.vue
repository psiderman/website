<script setup>
import "@/assets/blog.css";
import { RouterLink, RouterView } from "vue-router";

import { onMounted } from "vue";
import anime from "animejs";

onMounted(() => {
  const entrance = anime.timeline({});
  entrance
    .add({
      targets: ".psider-logo-top",
      translateY: ["1rem", "0"],
      opacity: [0, 1],
      scale: [0.95, 1],
      transformOrigin: "center",
      duration: 500,
      easing: "easeOutBack",
      delay: anime.stagger(100),
    })
    .add({
      targets: ".anime-entry, h1, h2, h3, p, li, span",
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
  <div class="content mx-auto min-h-dvh w-screen max-w-screen-lg p-4 lg:py-20">
    <RouterLink to="/">
      <img
        src="@/assets/svg/psider.svg"
        alt="logo"
        class="psider-logo-top mx-auto mb-20 select-none"
      />
    </RouterLink>
    <RouterView />
    <RouterLink to="/">
      <img
        src="@/assets/svg/psider.svg"
        alt="logo"
        class="mx-auto my-20 select-none"
      />
    </RouterLink>
  </div>
</template>
