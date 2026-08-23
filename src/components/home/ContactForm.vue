<template>
  <div data-sync="contact-form" class="w-full p-20">
    <div
      class="flex flex-col items-center justify-center gap-6 rounded-xl bg-gray-950 p-20 dark:bg-zinc-950"
    >
      <div class="flex flex-col gap-0 text-center">
        <span class="text-ui text-text-tertiary">come say hi</span>
        <p class="text-display text-light h-14">
          hi<span class="font-sans leading-14">@</span>psiderman.com
        </p>
      </div>
      <div class="flex flex-row gap-4">
        <button v-tooltip="{ content: 'write me', group: 'contact-form' }" class="btn inverted">
          copy email
        </button>
        <button
          v-for="btn in buttons"
          :key="btn.id"
          v-tooltip="{ content: btn.tooltip, group: 'contact-form' }"
          class="btn icon-only inverted"
          @click="openLink(btn.link)"
        >
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

import { openLink } from '@/utils'

const buttons = [
  {
    id: 'whatsapp',
    link: 'https://wa.me/psiderman',
    logo: faWhatsapp,
    tooltip: 'text me',
  },
  {
    id: 'instagram',
    link: 'https://instagram.com/psiderman',
    logo: faInstagram,
    tooltip: 'follow me',
  },
  {
    id: 'github',
    link: 'https://github.com/psiderman',
    logo: faGithub,
    tooltip: 'fork me',
  },
  {
    id: 'linkedin',
    link: 'https://www.linkedin.com/in/psiderman/',
    logo: faLinkedinIn,
    tooltip: 'hire me',
  },
  {
    id: 'reddit',
    link: 'https://www.youtube.com/watch?v=xvFZjo5PgG0',
    logo: faRedditAlien,
    tooltip: 'maybe don’t click here',
  },
]
</script>
