<template>
  <div class="flex flex-col items-center justify-center gap-6 rounded-xl bg-gray-900 p-20">
    <div class="flex flex-col gap-0 text-center">
      <span class="text-ui text-text-tertiary">come say hi</span>
      <p class="text-display text-text-inverted-primary h-14">
        hi<span class="font-sans leading-14">@</span>psiderman.com
      </p>
    </div>
    <div class="contact-buttons flex flex-row gap-4">
      <button>copy email</button>
      <button v-for="btn in buttons" :key="btn.id" class="icon-btn">
        <FA :icon="btn.logo" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  faGithub,
  faInstagram,
  faLinkedinIn,
  faRedditAlien,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons'

const buttons = [
  { id: 'whatsapp', logo: faWhatsapp },
  { id: 'instagram', logo: faInstagram },
  { id: 'github', logo: faGithub },
  { id: 'linkedin', logo: faLinkedinIn },
  { id: 'reddit', logo: faRedditAlien },
]
</script>

<style>
@reference "@/style.css";

.contact-buttons > button {
  @apply bg-press-inverted text-text-inverted-primary text-ui flex items-center justify-center rounded-full;
}

.contact-buttons > button.icon-btn {
  @apply size-10;
}

.contact-buttons > button:not(.icon-btn) {
  @apply h-10 px-6 py-2;
}
</style>
