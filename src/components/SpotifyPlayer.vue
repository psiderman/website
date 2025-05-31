<script setup>
import anime from "animejs";
import { onMounted, ref, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { formatDistance } from "date-fns";

const route = useRoute();
const router = useRouter();

const songData = ref({
  isPlaying: false,
});

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function enterAnimation(el, done) {
  anime({
    targets: el,
    translateY: ["3rem", "0"],
    opacity: [0, 1],
    scale: [0.95, 1],
    transformOrigin: "center",
    duration: 500,
    easing: "easeOutBack",
    complete: done,
  });
}

function leaveAnimation(el, done) {
  anime({
    targets: el,
    translateY: ["0", "3rem"],
    opacity: [1, 0],
    scale: [1, 0.95],
    transformOrigin: "center",
    duration: 400,
    easing: "easeInBack",
    complete: done,
  });
}

function getRelativeDate(date) {
  try {
    const d = new Date(date.DateTimeOriginal.replace("Z", ""));
    return formatDistance(d, new Date(), { addSuffix: true });
  } catch (error) {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  }
}

onMounted(async () => {
  const fetchSong = async () => {
    const res = await fetch("/api/music");
    if (res.ok) {
      songData.value = await res.json();
      nextTick(() => {
        const card = document.querySelector(".spotify-card");

        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const gradient = `radial-gradient(circle at ${x}px ${y}px, hsla(0, 0%, 100%, 5%) 0%, hsla(0, 0%, 100%, 2%) 80%)`;
          card.style.setProperty("background", gradient);
        });

        card.addEventListener("mouseleave", () => {
          card.style.setProperty("background", "hsla(0,0%,100%,2%)");
        });
      });
    }
  };

  fetchSong();
  const interval = setInterval(fetchSong, 10000);

  onUnmounted(() => clearInterval(interval));
});
</script>
<template>
  <transition @enter="enterAnimation" @leave="leaveAnimation" appear>
    <a
      v-if="songData.isPlaying"
      :href="songData.songUrl"
      target="_blank"
      class="rounded-3xl"
    >
      <div class="spotify-card">
        <div
          class="absolute inset-0 -z-10 h-full w-full rounded-3xl"
          :style="{
            backgroundColor: hexToRgba(songData.vividColor, 0.2),
            boxShadow: `0 0 0 1px ${hexToRgba(songData.vividColor, 0.3)}`,
          }"
        ></div>
        <img
          v-if="songData.albumImageUrl"
          class="h-8 w-8 shrink-0 rounded-sm border-white"
          :src="songData.albumImageUrl"
          :alt="
            songData.album ? `Album art for ${songData.album}` : 'Album art'
          "
          role="img"
        />
        <div
          class="text z-10 w-full flex-col gap-0 font-sans text-xs font-medium tracking-tight text-white"
        >
          <p class="mb-1 text-white/50">i'm now listening to</p>
          <p class="truncate text-white">
            {{ songData.title }}
          </p>
          <p class="truncate text-white/60">
            {{ songData.artist }}
          </p>
        </div>
        <div
          class="absolute right-4 top-4 z-10 flex h-8 w-6 flex-row items-center justify-center gap-x-1"
          v-if="songData.isPlaying"
        >
          <div
            class="waveform-bar"
            :style="{ backgroundColor: hexToRgba(songData.vividColor, 1) }"
          ></div>
          <div
            class="waveform-bar"
            :style="{ backgroundColor: hexToRgba(songData.vividColor, 1) }"
          ></div>
          <div
            class="waveform-bar"
            :style="{ backgroundColor: hexToRgba(songData.vividColor, 1) }"
          ></div>
        </div>
      </div>
    </a>
  </transition>
</template>

<style lang="postcss" scoped>
.spotify-card {
  @apply relative flex aspect-square cursor-pointer select-none flex-col items-start justify-between gap-2 rounded-3xl p-4;
  @apply border border-white/5 bg-white/[2%];
}

@keyframes bounceHeight {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 16px;
  }
}

/* Add a little delay and speed difference for each bar */
.waveform-bar {
  @apply relative overflow-hidden rounded;
  animation-name: bounceHeight;
  animation-duration: 800ms;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  width: 4px;
  height: 4px;
}

.waveform-bar::before {
  content: "";
  @apply absolute inset-0 bg-white/30;
}

/* Stagger animations for each bar */
.waveform-bar:nth-child(1) {
  animation-delay: 0ms;
}
.waveform-bar:nth-child(2) {
  animation-delay: 200ms;
  animation-duration: 600ms;
}
.waveform-bar:nth-child(3) {
  animation-delay: 400ms;
  animation-duration: 1000ms;
}
</style>
