<template>
  <footer
    data-sync="footer"
    class="text-text-inverted-secondary relative flex w-screen flex-col items-center justify-center gap-20 bg-gray-900 p-20 pb-0"
  >
    <button
      class="text-mono absolute inset-x-0 top-0 mx-auto flex w-fit flex-row items-center justify-center gap-2 rounded-b-xl bg-gray-800 px-4 py-1.5 text-gray-100 transition-colors hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
      @click="handleClick(`https://github.com/psiderman/website/commit/${commit}`)"
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
        <button class="outline-surface-primary/50! rounded-full px-2">terms</button>
        <span class="text-text-tertiary">✦</span>
        <button class="outline-surface-primary/50! rounded-full px-2">privacy</button>
      </div>
      <p>© 2026 Karan Sanas</p>
    </div>
    <div class="flex h-57.5 w-full items-start justify-center overflow-hidden">
      <img
        src="@/assets/svg/wordmark.svg"
        alt="psiderman wordmark"
        style="width: 1040px; height: 300px"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
const commit = __COMMIT_HASH__

const handleClick = (link: null | string) => {
  if (link) {
    window.open(link, '_blank')
  }
}
</script>
