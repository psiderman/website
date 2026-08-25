<template>
  <footer
    data-sync="footer"
    class="text-light/75 relative flex w-screen flex-col items-center justify-center gap-20 bg-gray-950 p-20 pb-0 dark:bg-zinc-950"
  >
    <button
      class="text-mono bg-light/10 text-light hover:bg-light/20 focus:bg-light/20 absolute inset-x-0 top-0 mx-auto flex w-fit flex-row items-center justify-center gap-2 rounded-b-xl px-4 py-1.5 transition-colors duration-200 focus:outline-none"
      @click="openLink(`https://github.com/psiderman/website/commit/${commit}`)"
    >
      <div class="flex size-4 items-center justify-center">
        <FA class="size-4" :icon="['fab', 'github']" />
      </div>
      <span class="h-3">
        {{ commit }}
      </span>
    </button>
    <div class="text-ui flex flex-col items-center justify-center gap-4">
      <div class="flex flex-row gap-3">
        <button class="rounded-full px-2 outline-gray-400! dark:outline-zinc-400!">terms</button>
        <span class="text-light/50">✦</span>
        <button class="rounded-full px-2 outline-gray-400! dark:outline-zinc-400!">privacy</button>
      </div>
      <p>© 2026 Karan Sanas</p>
    </div>
    <div
      class="desktop:flex pointer-events-none hidden h-57.5 w-full items-start justify-center overflow-hidden"
    >
      <img
        src="@/assets/svg/wordmark.svg"
        alt="psiderman wordmark"
        style="width: 1040px; height: 300px"
        width="1040"
        height="300"
      />
    </div>
    <div class="desktop:hidden h-10"></div>
  </footer>
</template>

<script setup lang="ts">
import { openLink } from '@/utils'

const commit = __COMMIT_HASH__
</script>
