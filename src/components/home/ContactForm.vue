<template>
  <div data-sync="contact-form" class="w-full p-20">
    <div class="flex flex-col items-center justify-center gap-6 rounded-xl bg-gray-900 p-20">
      <div class="flex flex-col gap-0 text-center">
        <span class="text-ui text-text-tertiary">come say hi</span>
        <p class="text-display text-text-inverted-primary h-14">
          hi<span class="font-sans leading-14">@</span>psiderman.com
        </p>
      </div>
      <div class="flex flex-row gap-4">
        <button class="btn inverted">copy email</button>
        <button v-for="btn in buttons" :key="btn.id" class="btn icon-only inverted">
          <FA :icon="btn.logo" />
        </button>
      </div>
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
