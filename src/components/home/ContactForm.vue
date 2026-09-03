<template>
  <div data-sync="contact-form" class="desktop:px-20 desktop:py-20 w-full px-4 py-10">
    <div
      class="desktop:p-20 desktop:gap-6 flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-950 p-6 py-12 dark:bg-zinc-950"
    >
      <div class="flex flex-col gap-0 text-center">
        <span class="text-ui text-text-tertiary">spam me</span>
        <p class="desktop:text-display text-h1 text-light">
          hi<span class="font-sans leading-14">@</span>psiderman.com
        </p>
      </div>
      <div class="flex flex-row flex-wrap justify-center gap-4">
        <button
          v-tooltip="{ content: 'write me', group: 'contact-form' }"
          class="btn inverted desktop:flex hidden"
          @click="handleCopyEmail"
        >
          copy email
        </button>
        <button
          v-for="btn in buttons"
          :key="btn.id"
          v-tooltip="{ content: btn.tooltip, group: 'contact-form' }"
          class="btn icon-only inverted"
          :aria-label="btn.tooltip"
          @click="handleButtonClick(btn)"
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
import { trackEvent } from '@/utils/analytics'

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
    tooltip: 'psychoanalyze me',
  },
]

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const handleButtonClick = (btn: (typeof buttons)[number]) => {
  if (btn.id === 'reddit') {
    trackEvent('click_rickroll', { platform: 'reddit' })
  } else {
    trackEvent('click_contact_link', { platform: btn.id })
  }
  openLink(btn.link)
}

async function handleCopyEmail(event: MouseEvent) {
  trackEvent('copy_email')
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText('hi@psiderman.com')
    } else {
      // Fallback for insecure contexts (like local network IP testing)
      const textArea = document.createElement('textarea')
      textArea.value = 'hi@psiderman.com'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    const copiedMessage = document.createElement('span')
    copiedMessage.textContent = 'Copied'
    copiedMessage.ariaLive = 'polite'
    copiedMessage.classList.add(
      'rounded-full',
      'bg-emerald-600',
      'px-2',
      'py-0',
      'text-ui-small',
      'font-medium',
      'text-light',
      'z-50',
      'pointer-events-none',
    )

    document.body.appendChild(copiedMessage)

    const messageX = event.pageX - copiedMessage.offsetWidth / 2
    const messageY = event.pageY - copiedMessage.offsetHeight / 2 - 20

    // Set the position for the centered message
    copiedMessage.style.position = 'absolute'
    copiedMessage.style.top = `${messageY}px`
    copiedMessage.style.left = `${messageX}px`

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    void import('animejs').then(({ animate }) => {
      if (prefersReducedMotion) {
        animate(copiedMessage, {
          duration: 1500,
          onComplete: () => {
            document.body.removeChild(copiedMessage)
          },
          opacity: [
            { duration: 200, to: 1 },
            { duration: 1300, to: 0 },
          ],
        })
      } else {
        const direction = random(0, 1)
        const plusminus = direction ? '+' : '-'
        const flingYLength = random(20, 50)
        const flingXLength = random(0, 50)
        const rotation = random(10, 15) * (flingXLength / 50)

        animate(copiedMessage, {
          duration: random(500, 1000),
          ease: 'out(2)',
          onComplete: () => {
            document.body.removeChild(copiedMessage)
          },
          opacity: [{ duration: 2000, ease: 'inOut(2)', to: 0 }],
          rotate: `${plusminus}${rotation}deg`,
          x: `${plusminus}=${flingXLength}px`,
          y: `-=${flingYLength}px`,
        })
      }
    })
  } catch {
    return
  }
}
</script>
