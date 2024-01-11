<script setup>
import "@/assets/blog.css";
import { RouterLink, RouterView } from "vue-router";

import { ref } from "vue";
const heartFill = ref(false);

function fillHeart() {
  heartFill.value = !heartFill.value;
}
</script>
<template>
  <div
    class="content mx-auto min-h-dvh w-screen max-w-screen-lg p-10 lg:px-0 lg:py-20"
  >
    <RouterLink to="/">
      <img
        src="@/assets/svg/psider.svg"
        alt="logo"
        class="anime-entry mx-auto mb-20 select-none"
      />
    </RouterLink>
    <RouterView />
    <div
      class="mt-20 flex w-full select-none flex-col items-center justify-center gap-y-1 text-center text-base text-white/50"
    >
      <span class="anime-entry">
        ©️ Karan Sanas {{ new Date().getFullYear() }}
      </span>
      <span class="anime-entry"
        >Handcrafted with Figma, Vue.js, and&nbsp;&nbsp;<fa
          @click="fillHeart"
          :class="[heartFill ? 'text-red-500' : '', 'cursor-pointer']"
          :icon="[heartFill ? 'fas' : 'far', 'heart']"
        />
      </span>
    </div>
    <div class="w640 mt-8 flex flex-row flex-wrap justify-center text-white/50">
      <RouterLink
        to="/"
        class="anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Home</RouterLink
      >
      <a
        href="https://twitter.com/_psiderman_"
        target="_blank"
        class="anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Twitter</a
      >
      <a
        href="https://github.com/psiderman/website"
        target="_blank"
        class="anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Github</a
      >
      <a
        href="https://psiderman.read.cv"
        target="_blank"
        class="anime-entry rounded-full px-4 py-1 underline underline-offset-4 hover:text-white/80 focus:bg-white/10 focus:text-white/80 focus:no-underline"
        >Read.cv</a
      >
    </div>
  </div>
</template>
