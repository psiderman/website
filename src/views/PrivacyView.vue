<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="flex flex-col px-20">
      <div class="flex flex-col gap-20 pt-10">
        <!-- Breadcrumbs -->
        <div class="text-ui flex flex-row items-center justify-start gap-2">
          <router-link to="/" class="breadcrumb main">home</router-link>
          <ChevronRight class="text-text-secondary" :size="16" aria-hidden="true" />
          <span class="breadcrumb level">privacy</span>
        </div>

        <!-- Header -->
        <div class="text-p mx-auto w-full max-w-prose text-left">
          <h1 class="text-display -mb-14">Privacy Policy</h1>
          <p class="text-text-secondary text-ui-small mt-16">Last updated: August 25, 2026</p>
        </div>

        <!-- Content -->
        <div class="text-p text-text-primary mx-auto max-w-prose space-y-6 pb-20 text-left">
          <p>
            I respect your privacy and am committed to protecting your personal data. This privacy
            policy explains how I handle your information when you use this website.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">1. Information I Collect</h2>
          <p>
            When you sign in using your Google account, I collect your name, email address, and
            profile picture URL provided by Google.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">2. How I Use Your Information</h2>
          <p>
            I use this information solely to authenticate you, create your user session, and
            personalize your experience (such as displaying your name and profile picture on the
            site).
          </p>

          <h2 class="text-h2 pt-4 font-semibold">3. Google API Limited Use Adherence</h2>
          <p>
            My use and transfer of information received from Google APIs to any other app will
            adhere to the
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-text-secondary underline"
            >
              Google API Services User Data Policy</a
            >, including the Limited Use requirements.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">4. Sharing and Storage</h2>
          <p>
            Your profile data is stored securely in my Supabase database. I do not share, sell, or
            distribute your data to any third parties. But if I get a really good deal (especially
            for any art that you create in the guestbook), I will write to you letting you know at
            least 24 hours in advance before selling your data from this website.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">5. Data Deletion and Control</h2>
          <p>
            You can revoke access to this site at any time via your Google Account settings. If you
            would like me to delete your profile data from my database, please contact me and I will
            remove it promptly.
          </p>

          <h2 class="text-h2 pt-4 font-semibold">6. Contact</h2>
          <p>
            If you have any questions, you can reach out to me via the contact form on the home
            page.
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
