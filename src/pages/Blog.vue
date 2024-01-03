<script setup>
import "@/assets/blog.css";
import { RouterLink, RouterView } from "vue-router";
</script>
<template>
  <div class="content mx-auto min-h-dvh w-screen max-w-screen-lg p-4 lg:py-20">
    <RouterLink to="/">
      <img
        src="@/assets/svg/psider.svg"
        alt="logo"
        class="anime-entry mx-auto mb-20 select-none"
      />
    </RouterLink>
    <RouterView />
    <RouterLink to="/">
      <img
        src="@/assets/svg/psider.svg"
        alt="logo"
        class="anime-entry mx-auto my-20 select-none"
      />
    </RouterLink>
    <div
      class="anime-entry pointer-events-none flex w-full select-none flex-col items-center justify-center gap-y-1 text-center text-base text-white/50"
    >
      <span> ©️ Karan Sanas {{ new Date().getFullYear() }} </span>
      <span> Handcrafted, with love. </span>
    </div>
  </div>
</template>
