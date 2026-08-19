<template>
  <footer
    class="text-text-inverted-secondary footer-shadow relative flex w-screen flex-col items-center justify-center gap-20 bg-gray-900 p-20 pb-0"
  >
    <div
      class="text-mono absolute inset-x-0 top-0 mx-auto flex w-fit flex-row items-center justify-center gap-2 rounded-b-xl bg-gray-800 px-4 py-1.5 text-gray-100"
    >
      <FA class="" :icon="['fab', 'github']" />
      {{ commit }}
    </div>
    <div class="text-ui flex flex-col items-center justify-center gap-4">
      <div class="flex flex-row gap-3">
        <button>terms</button>
        <span class="text-text-tertiary">✦</span>
        <button>privacy</button>
      </div>
      <p>© 2026 Karan Sanas</p>
    </div>
    <div class="h-57.5 w-fit">
      <img
        src="@/assets/svg/wordmark.svg"
        alt="psiderman wordmark"
        style="width: 1040px; height: 300px"
        class=""
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
const commit = __COMMIT_HASH__
</script>

<style>
@reference "@/style.css";

.footer-shadow {
  box-shadow: 0px 400px 0px 0px var(--color-gray-900);
}
</style>
