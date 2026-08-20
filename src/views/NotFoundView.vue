<template>
  <div class="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
    <h1 class="text-text-primary text-6xl font-bold">404</h1>
    <p class="text-text-secondary text-xl">Oops! This page doesn't exist.</p>
    <router-link
      to="/"
      class="bg-surface-primary outline-border-primary hover:bg-surface-secondary text-text-primary mt-4 rounded-lg px-6 py-3 font-medium outline transition-colors"
    >
      Return Home
    </router-link>
  </div>
</template>
