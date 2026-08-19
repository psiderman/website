<template>
  <div class="flex h-screen w-screen flex-col items-center justify-center gap-4 px-10">
    <div class="anime-entry absolute inset-0 z-50 mx-auto mt-20 h-20 w-20">
      <PsiderLogo />
    </div>
    <h1
      class="anime-entry text-[200px] leading-none font-semibold tracking-tighter text-white/20 diagonal-fractions"
    >
      404
    </h1>
    <p class="anime-entry max-w-screen-sm text-center text-base text-white/50">
      To get back at the website, make the spider drop his little heart.
    </p>
    <RouterLink to="/">
      <Button class="anime-entry" text="Back home" icon="arrow-left" :reverse="true" />
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import Button from '@/components/Button.vue'
import PsiderLogo from '@/components/PsiderLogo.vue'

onMounted(() => {
  anime({
    delay: anime.stagger(100),
    duration: 500,
    easing: 'easeOutBack',
    opacity: [0, 1],
    scale: [0.95, 1],
    targets: '.anime-entry',
    transformOrigin: 'center',
    translateY: ['3rem', '0'],
  })
})
</script>
