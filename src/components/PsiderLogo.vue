<template>
  <div
    class="psider-logo z-50 h-20 w-20 shrink-0 cursor-pointer bg-contain"
    @click="spiderAnimation"
  >
    <div
      ref="silkStrandEl"
      :class="['silkStrand bg-light absolute h-screen w-px', spiderAnimationFlag ? 'hidden' : '']"
    ></div>
    <svg
      id="spider-heart"
      ref="heartEl"
      class="spider-rotatable absolute"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref="heartPathEl"
        d="M41.5257 58.9672C41.5257 58.9672 41.0042 57.0926 40.0809 57.0956C39.1598 57.0986 38.6457 58.9672 38.6457 58.9672"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
    </svg>

    <svg
      id="spider"
      ref="spiderEl"
      class="spider-rotatable absolute"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="spider-torso"
        d="M39.706 40.9681C29.7813 41.4646 36.586 56.32 36.586 56.32M39.706 40.9681C49.8819 40.4591 44.266 56.32 44.266 56.32M39.706 40.9681C29.7813 41.4646 35.626 26.56 35.626 26.56C35.626 26.56 37.2496 21.8959 39.706 21.76C42.2876 21.6172 44.266 26.56 44.266 26.56C44.266 26.56 49.8819 40.4591 39.706 40.9681Z"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
      <path
        id="spider-R2"
        ref="spiderR2El"
        d="M61.546 16C62.3956 26.1531 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16.8409 25.6265 19.306 16"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
      <path
        id="spider-R1"
        ref="spiderR1El"
        d="M51.946 20.8C56.1921 30.0616 49.8818 40.4591 39.706 40.9681C29.7812 41.4646 22.9916 28.7854 28.906 20.8"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
      <path
        id="spider-F2"
        ref="spiderF2El"
        d="M19.306 54.4C23.6839 45.4792 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 57.4097 45.0888 61.546 54.4"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
      <path
        id="spider-F1"
        ref="spiderF1El"
        d="M28.906 64C22.9407 56.0525 29.7813 41.4646 39.706 40.9681C49.8818 40.4591 58.0617 55.8511 51.946 64"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { createTimeline } from 'animejs'
import { ref } from 'vue'

const spiderAnimationFlag = ref(true)

const emit = defineEmits<{
  (e: 'animationStart'): void
  (e: 'animationEnd'): void
}>()

const silkStrandEl = ref<HTMLElement | null>(null)
const heartEl = ref<null | SVGSVGElement>(null)
const heartPathEl = ref<null | SVGPathElement>(null)
const spiderEl = ref<null | SVGSVGElement>(null)
const spiderR2El = ref<null | SVGPathElement>(null)
const spiderR1El = ref<null | SVGPathElement>(null)
const spiderF2El = ref<null | SVGPathElement>(null)
const spiderF1El = ref<null | SVGPathElement>(null)

function spiderAnimation() {
  if (!spiderAnimationFlag.value) return
  spiderAnimationFlag.value = false
  emit('animationStart')

  const spiderTimeline = createTimeline({
    autoplay: true,
  })

  // 1. Make heart red
  if (heartPathEl.value) {
    spiderTimeline.add(
      heartPathEl.value,
      {
        duration: 0,
        stroke: '#ef4444',
      },
      0,
    )
  }

  // 2. Drop heart straight down in screen space and rotate to 0deg
  if (heartEl.value) {
    spiderTimeline.add(
      heartEl.value,
      {
        duration: 500,
        ease: 'linear',
        rotate: ['173deg', '0deg'],
        translateY: `${window.innerHeight - 150}px`,
      },
      100,
    )
  }

  // 3. Rotate spider body to straight down (0deg) AFTER heart drops
  if (spiderEl.value) {
    spiderTimeline.add(
      spiderEl.value,
      {
        duration: 300,
        ease: 'outQuad',
        rotate: ['173deg', '0deg'],
      },
      700,
    )
  }

  // 4. Move rear 2 on the way down
  if (spiderR2El.value) {
    spiderTimeline.add(
      spiderR2El.value,
      {
        d: [
          'M61.546 16C62.3956 26.1531 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16.8409 25.6265 19.306 16',
          'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
          'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
          'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
          'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
          'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
          'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
          'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
          'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
          'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
          'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
        ],
        duration: 3000,
        ease: 'linear',
      },
      2000,
    )
  }

  // 5. Move rear 1 on the way down
  if (spiderR1El.value) {
    spiderTimeline.add(
      spiderR1El.value,
      {
        d: [
          'M51.946 20.8C56.1921 30.0616 49.8818 40.4591 39.706 40.9681C29.7812 41.4646 22.9916 28.7854 28.906 20.8',
          'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
          'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
          'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
          'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
          'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
          'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
          'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
          'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
          'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
          'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
        ],
        duration: 3000,
        ease: 'linear',
      },
      2000,
    )
  }

  // 6. Move spider body straight down
  if (spiderEl.value) {
    spiderTimeline.add(
      spiderEl.value,
      {
        duration: 3000,
        ease: 'linear',
        translateY: `${window.innerHeight - 160}px`,
      },
      2000,
    )
  }

  // 7. Move front 2
  if (spiderF2El.value) {
    spiderTimeline.add(
      spiderF2El.value,
      {
        d: [
          'M19.306 54.4C23.6839 45.4792 29.7813 41.4646 39.706 40.9681C49.8818 40.4591 57.4097 45.0888 61.546 54.4',
          'M24.5 58.5C19.5 45 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 60 47 55.5 58.5',
        ],
        duration: 250,
        ease: 'linear',
      },
      5000,
    )
  }

  // 8. Move front 1
  if (spiderF1El.value) {
    spiderTimeline.add(
      spiderF1El.value,
      {
        d: [
          'M28.906 64C22.9408 56.0525 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 58.0617 55.8511 51.946 64',
          'M36.5 68C30.5348 60.0525 29.7813 41.4646 39.7061 40.9681C49.8819 40.4591 49.6157 59.8511 43.5 68',
          'M36.5 60C24.5 69.5 29.7812 41.4646 39.706 40.9681C49.8818 40.4591 54 70 43.5 60',
        ],
        duration: 500,
        ease: 'linear',
      },
      5000,
    )
  }

  // 9. Reset front 2
  if (spiderF2El.value) {
    spiderTimeline.add(
      spiderF2El.value,
      {
        d: [
          'M24.5 58.5C19.5 45 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 60 47 55.5 58.5',
          'M19.306 54.4C23.6839 45.4792 29.7813 41.4646 39.706 40.9681C49.8818 40.4591 57.4097 45.0888 61.546 54.4',
        ],
        duration: 500,
        ease: 'linear',
      },
      5500,
    )
  }

  // 10. Reset front 1
  if (spiderF1El.value) {
    spiderTimeline.add(
      spiderF1El.value,
      {
        d: [
          'M36.5 60C24.5 69.5 29.7812 41.4646 39.706 40.9681C49.8818 40.4591 54 70 43.5 60',
          'M28.906 64C22.9408 56.0525 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 58.0617 55.8511 51.946 64',
        ],
        duration: 500,
        ease: 'linear',
      },
      5500,
    )
  }

  // 11. Move heart slightly up
  if (heartEl.value) {
    spiderTimeline.add(
      heartEl.value,
      {
        duration: 250,
        ease: 'linear',
        translateY: `${window.innerHeight - 160}px`,
      },
      5250,
    )
  }

  // 12. Move rear 2 on the way up
  if (spiderR2El.value) {
    spiderTimeline.add(
      spiderR2El.value,
      {
        d: [
          'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
          'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
          'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
          'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
          'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
          'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
          'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
          'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
          'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
          'M61.546 16C62.3956 26.1531 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16.8409 25.6265 19.306 16',
        ],
        duration: 3000,
        ease: 'linear',
      },
      6000,
    )
  }

  // 13. Move rear 1 on the way up
  if (spiderR1El.value) {
    spiderTimeline.add(
      spiderR1El.value,
      {
        d: [
          'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
          'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
          'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
          'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
          'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
          'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
          'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
          'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
          'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
          'M51.946 20.8C56.1921 30.0616 49.8818 40.4591 39.706 40.9681C29.7812 41.4646 22.9916 28.7854 28.906 20.8',
        ],
        duration: 3000,
        ease: 'linear',
      },
      6000,
    )
  }

  // 14. Move spider body back up
  if (spiderEl.value) {
    spiderTimeline.add(
      spiderEl.value,
      {
        duration: 3000,
        ease: 'linear',
        translateY: 0,
      },
      6000,
    )
  }

  // 15. Move heart back up
  if (heartEl.value) {
    spiderTimeline.add(
      heartEl.value,
      {
        duration: 3000,
        ease: 'linear',
        translateY: 0,
      },
      6000,
    )
  }

  // 16. Silk strand animation (disappears before rotation)
  if (silkStrandEl.value) {
    spiderTimeline
      .add(
        silkStrandEl.value,
        {
          duration: 200,
          ease: 'linear',
          opacity: 1,
        },
        2000,
      )
      .add(
        silkStrandEl.value,
        {
          duration: 3000,
          ease: 'linear',
          translateY: `${window.innerHeight - 160}px`,
        },
        2000,
      )
      .add(
        silkStrandEl.value,
        {
          duration: 3000,
          ease: 'linear',
          translateY: 0,
        },
        6000,
      )
      .add(
        silkStrandEl.value,
        {
          duration: 200,
          ease: 'linear',
          opacity: 0,
        },
        8800,
      )
  }

  // 17. Put spider and heart back in original rotation AFTER strand disappears
  if (spiderEl.value) {
    spiderTimeline.add(
      spiderEl.value,
      {
        duration: 350,
        ease: 'outQuad',
        rotate: ['0deg', '173deg'],
      },
      9100,
    )
  }
  if (heartEl.value) {
    spiderTimeline.add(
      heartEl.value,
      {
        duration: 350,
        ease: 'outQuad',
        rotate: ['0deg', '173deg'],
      },
      9100,
    )
  }
  if (heartPathEl.value) {
    spiderTimeline.add(
      heartPathEl.value,
      {
        duration: 200,
        stroke: '#ffffff',
      },
      9450,
    )
  }

  setTimeout(() => {
    spiderAnimationFlag.value = true
    emit('animationEnd')
  }, 9600)
}
</script>

<style scoped>
.spider-rotatable {
  transform: rotate(173deg);
  transform-origin: 40px 40px;
}

.psider-logo:hover #spider-heart path {
  stroke: #ef4444;
  transition: stroke 200ms ease;
}

.silkStrand {
  opacity: 0;
  bottom: calc(5rem - 21.76px);
  left: 38.71px;
}
</style>
