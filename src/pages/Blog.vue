<script setup>
import "@/assets/blog.css";
import { RouterLink, RouterView } from "vue-router";
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
      class="anime-entry mt-20 flex w-full select-none flex-col items-center justify-center gap-y-1 text-center text-base text-white/50"
    >
      <span> ©️ Karan Sanas {{ new Date().getFullYear() }} </span>
      <span>
        <a
          href="https://github.com/psiderman/website"
          target="_blank"
          class="underline underline-offset-4 hover:text-white/80"
          >Handcrafted</a
        >, with love.
      </span>
    </div>
  </div>
</template>
