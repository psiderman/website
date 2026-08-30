<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="flex flex-col px-20">
      <div class="flex flex-col gap-20 pt-10">
        <!-- Breadcrumbs -->
        <div class="text-ui flex flex-row items-center justify-start gap-2">
          <router-link to="/" class="breadcrumb main">home</router-link>
          <ChevronRight class="text-text-secondary" :size="16" aria-hidden="true" />
          <span class="breadcrumb level">terms</span>
        </div>

        <!-- Header -->
        <div v-reveal class="text-p mx-auto w-full max-w-prose text-left">
          <h1 class="text-display -mb-14">Terms of Service</h1>
          <p class="text-text-secondary text-ui-small mt-16">Last updated: August 25, 2026</p>
        </div>

        <!-- Content -->
        <div
          v-reveal="120"
          class="text-p text-text-primary mx-auto max-w-prose space-y-6 pb-20 text-left"
        >
          <p>
            Welcome to my personal website! By accessing or using this site, you agree to comply
            with and be bound by these Terms of Service.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">1. Use of the Site</h2>
          <p>
            I provide this website "as is" for personal use. You may browse and interact with the
            available features, but please do not try to break, scrape, or abuse the services.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">2. Account Responsibility</h2>
          <p>
            If you choose to sign in using your Google account, you are responsible for maintaining
            the security of your session and any activity that occurs under your profile.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">3. You Owe Me</h2>
          <p>
            If you log in to this website, you owe me a drink of your choice in a city of your
            choice. If you end up stalking me on this website, you must let me know and you now owe
            me a snack as well. Scout’s honor.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">4. Limitation of Liability</h2>
          <p>
            I am not liable for any damages or issues arising from your use of this website.
            Everything is provided without warranties of any kind.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">5. Changes to Terms</h2>
          <p>
            I reserve the right to update these terms at any time. The date at the top will indicate
            when they were last changed.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
</script>

<style scoped>
@reference "@/style.css";

.breadcrumb {
  @apply hover:bg-hover active:bg-press rounded-lg px-2 py-1;

  &.main {
    @apply text-text-tertiary;
  }

  &.level {
    @apply text-text-secondary;
  }
}
</style>
