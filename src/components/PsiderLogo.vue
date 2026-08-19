<template>
  <div class="psider-logo z-50 h-20 w-20 cursor-pointer bg-contain" @click="spiderAnimation">
    <div
      :class="['silkStrand absolute h-screen w-px bg-white', spiderAnimationFlag ? 'hidden' : '']"
    ></div>
    <svg
      id="spider-heart"
      class="absolute"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M41.5257 58.9672C41.5257 58.9672 41.0042 57.0926 40.0809 57.0956C39.1598 57.0986 38.6457 58.9672 38.6457 58.9672"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
    </svg>

    <svg
      id="spider"
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
        d="M61.546 16C62.3956 26.1531 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16.8409 25.6265 19.306 16"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
      <path
        id="spider-R1"
        d="M51.946 20.8C56.1921 30.0616 49.8818 40.4591 39.706 40.9681C29.7812 41.4646 22.9916 28.7854 28.906 20.8"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
      <path
        id="spider-F2"
        d="M19.306 54.4C23.6839 45.4792 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 57.4097 45.0888 61.546 54.4"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
      <path
        id="spider-F1"
        d="M28.906 64C22.9407 56.0525 29.7813 41.4646 39.706 40.9681C49.8818 40.4591 58.0617 55.8511 51.946 64"
        stroke="white"
        stroke-width="2.30542"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs/lib/anime.es.js'
import { ref } from 'vue'

const spiderAnimationFlag = ref(true)

function spiderAnimation() {
  if (spiderAnimationFlag.value) {
    spiderAnimationFlag.value = false

    const spiderTimeline = anime.timeline({})
    spiderTimeline
      // rotate to straight down
      .add(
        {
          duration: 200,
          easing: 'easeOutQuad',
          rotateZ: ['173deg', '0deg'],
          targets: '.psider-logo',
        },
        0,
      )
      // make heart red
      .add(
        {
          duration: 0,
          stroke: '#ef4444',
          targets: '#spider-heart path',
        },
        0,
      )
      // drop heart straight
      .add(
        {
          duration: 500,
          easing: 'linear',
          targets: '#spider-heart',
          translateY: window.innerHeight - 150 + 'px',
        },
        450,
      )
      // move rear 2 on the way down
      .add(
        {
          d: [
            {
              value: [
                'M61.546 16C62.3956 26.1531 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16.8409 25.6265 19.306 16',
                'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
              ],
            },
            {
              value: 'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
            },
            {
              value: 'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
            },
            {
              value: 'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
            },
            {
              value: 'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
            },
            {
              value: 'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
            },
            {
              value: 'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
            },
            {
              value: 'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
            },
            {
              value: 'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
            },
            {
              value: 'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
            },
          ],
          duration: 3000,
          easing: 'linear',
          targets: 'svg #spider-R2',
        },
        2000,
      )
      // move rear 1 on the way down
      .add(
        {
          d: [
            {
              value: [
                'M51.946 20.8C56.1921 30.0616 49.8818 40.4591 39.706 40.9681C29.7812 41.4646 22.9916 28.7854 28.906 20.8',
                'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
              ],
            },
            {
              value:
                'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
            },
            {
              value:
                'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
            },
            {
              value:
                'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
            },
            {
              value:
                'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
            },
            {
              value:
                'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
            },
            {
              value:
                'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
            },
            {
              value:
                'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
            },
            {
              value:
                'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
            },
            {
              value:
                'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
            },
          ],
          duration: 3000,
          easing: 'linear',
          targets: 'svg #spider-R1',
        },
        2000,
      )
      // move spider straight down
      .add(
        {
          duration: 3000,
          easing: 'linear',
          targets: '#spider',
          translateY: window.innerHeight - 160 + 'px',
        },
        2000,
      )
      // move front 2
      .add(
        {
          d: [
            {
              value: [
                'M19.306 54.4C23.6839 45.4792 29.7813 41.4646 39.706 40.9681C49.8818 40.4591 57.4097 45.0888 61.546 54.4',
                'M24.5 58.5C19.5 45 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 60 47 55.5 58.5',
              ],
            },
          ],
          duration: 250,
          easing: 'linear',
          targets: 'svg #spider-F2',
        },
        5000,
      )
      // move front 1
      .add(
        {
          d: [
            {
              value: [
                'M28.906 64C22.9408 56.0525 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 58.0617 55.8511 51.946 64',
                'M36.5 68C30.5348 60.0525 29.7813 41.4646 39.7061 40.9681C49.8819 40.4591 49.6157 59.8511 43.5 68',
              ],
            },
            {
              value:
                'M36.5 60C24.5 69.5 29.7812 41.4646 39.706 40.9681C49.8818 40.4591 54 70 43.5 60',
            },
          ],
          duration: 500,
          easing: 'linear',
          targets: 'svg #spider-F1',
        },
        5000,
      )
      // reset front 2
      .add(
        {
          d: [
            {
              value: [
                'M24.5 58.5C19.5 45 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 60 47 55.5 58.5',
                'M19.306 54.4C23.6839 45.4792 29.7813 41.4646 39.706 40.9681C49.8818 40.4591 57.4097 45.0888 61.546 54.4',
              ],
            },
          ],
          duration: 500,
          easing: 'linear',
          targets: 'svg #spider-F2',
        },
        5500,
      )
      // reset front 1
      .add(
        {
          d: [
            {
              value: [
                'M36.5 60C24.5 69.5 29.7812 41.4646 39.706 40.9681C49.8818 40.4591 54 70 43.5 60',
                'M28.906 64C22.9408 56.0525 29.7813 41.4646 39.706 40.9681C49.8819 40.4591 58.0617 55.8511 51.946 64',
              ],
            },
          ],
          duration: 500,
          easing: 'linear',
          targets: 'svg #spider-F1',
        },
        5500,
      )

      // move heart slightly up
      .add(
        {
          duration: 250,
          easing: 'linear',
          targets: '#spider-heart',
          translateY: window.innerHeight - 160 + 'px',
        },
        5250,
      )
      // move rear 2 on the way up
      .add(
        {
          d: [
            {
              value: 'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
            },
            {
              value: 'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
            },
            {
              value: 'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
            },
            {
              value: 'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
            },
            {
              value: 'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
            },
            {
              value: 'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
            },
            {
              value: 'M40 16C64 24 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 20 40 12',
            },
            {
              value: 'M40 8.00001C52 16 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16 23 40 20',
            },
            {
              value: [
                'M40 12C52 20 49.8819 40.4591 39.706 40.9682C29.7813 41.4646 28 16 40 8.00002',
                'M61.546 16C62.3956 26.1531 49.8819 40.4591 39.706 40.9681C29.7813 41.4646 16.8409 25.6265 19.306 16',
              ],
            },
          ],
          duration: 3000,
          easing: 'linear',
          targets: 'svg #spider-R2',
        },
        6000,
      )
      // move rear 1 on the way up
      .add(
        {
          d: [
            {
              value:
                'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
            },
            {
              value:
                'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
            },
            {
              value:
                'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
            },
            {
              value:
                'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
            },
            {
              value:
                'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
            },
            {
              value:
                'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
            },
            {
              value:
                'M40 7.99954C52 15.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 22 40 19.9996',
            },
            {
              value:
                'M40 15.9995C64 23.9996 49.8818 40.4587 39.706 40.9677C29.7812 41.4641 28 14 40 11.9996',
            },
            {
              value: [
                'M40 19.9995C64 27.9996 49.8818 40.4587 39.706 40.9677C29.7813 41.4641 16 24 40 15.9996',
                'M51.946 20.8C56.1921 30.0616 49.8818 40.4591 39.706 40.9681C29.7812 41.4646 22.9916 28.7854 28.906 20.8',
              ],
            },
          ],
          duration: 3000,
          easing: 'linear',
          targets: 'svg #spider-R1',
        },
        6000,
      )
      // move spider back up
      .add(
        {
          duration: 3000,
          easing: 'linear',
          targets: '#spider',
          translateY: 0,
        },
        6000,
      )
      // move heart back up
      .add(
        {
          duration: 3000,
          easing: 'linear',
          targets: '#spider-heart',
          translateY: 0,
        },
        6000,
      )
      // put spider back in og position (rotate)
      .add(
        {
          duration: 1,
          easing: 'easeOutQuad',
          rotateZ: ['0deg', '173deg'],
          targets: '.psider-logo',
        },
        9000,
      )
      // show the silk strand
      .add(
        {
          duration: 200,
          easing: 'linear',
          opacity: 1,
          targets: '.silkStrand',
        },
        2000,
      )
      // move the silk strand down
      .add(
        {
          duration: 3000,
          easing: 'linear',
          targets: '.silkStrand',
          translateY: window.innerHeight - 160 + 'px',
        },
        2000,
      )
      // hide the silk strand
      .add(
        {
          duration: 1,
          easing: 'linear',
          opacity: 0,
          targets: '.silkStrand',
        },
        9000,
      )
      // move the silk strand up
      .add(
        {
          duration: 3000,
          easing: 'linear',
          targets: '.silkStrand',
          translateY: 0,
        },
        6000,
      )

    setTimeout(() => {
      spiderAnimationFlag.value = true
    }, 9100)
  }
}
</script>

<style scoped>
.psider-logo {
  transform: rotate(173deg);
  transition: all 400ms;
}

.psider-logo:hover #spider-heart path {
  stroke: #ef4444;
}

.silkStrand {
  opacity: 0;
  bottom: calc(5rem - 21.76px);
  left: 38.71px;
}
</style>
