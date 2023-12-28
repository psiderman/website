<script setup>
import "@/assets/blog.css";
import { RouterLink, RouterView } from "vue-router";
</script>
<template>
  <div class="content mx-auto min-h-dvh w-screen max-w-screen-lg py-20">
    <RouterLink to="/">
      <img
        src="@/assets/svg/psider.svg"
        alt="logo"
        class="mx-auto mb-20 select-none"
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
