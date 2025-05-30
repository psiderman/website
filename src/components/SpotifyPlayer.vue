<script setup>
import anime from "animejs";
import { onMounted, ref, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { formatDistance } from "date-fns";

const route = useRoute();
const router = useRouter();

const songData = ref({
  isPlaying: false,
  lastPlayed: false,
});

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

function openSong() {
  if (songData.value.songUrl) {
    window.open(songData.value.songUrl, "_blank");
  }
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
    }
    console.log(songData.value);
  };

  fetchSong();
  const interval = setInterval(fetchSong, 1000);

  onUnmounted(() => clearInterval(interval));
});
</script>
<template>
  <transition @enter="enterAnimation" @leave="leaveAnimation" appear>
    <div
      class="fixed bottom-8 right-8"
      v-if="songData.isPlaying || songData.lastPlayed"
    >
      <div
        class="spotify-entry flex h-16 w-80 cursor-pointer select-none flex-row items-center gap-2 rounded-2xl bg-black p-4"
        @click="openSong"
      >
        <div
          :class="[
            'h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-white/10',
            songData.isPlaying || songData.lastPlayed ? '' : 'skeleton-shimmer',
          ]"
        >
          <img
            :src="songData.albumImageUrl"
            :alt="
              songData.album ? `Album art for ${songData.album}` : 'Album art'
            "
            role="img"
          />
        </div>
        <div class="w-full flex-col gap-0 truncate font-sans text-xs">
          <p class="truncate font-semibold text-white/90">
            {{ songData.title }}
            <span class="font-normal text-white/60"
              >by {{ songData.artist }}</span
            >
          </p>
          <p
            v-if="songData.isPlaying"
            class="font-regular truncate text-white/60"
          >
            now listening
          </p>
          <p
            v-else-if="songData.lastPlayed"
            class="font-regular truncate text-white/60"
          >
            last played {{ getRelativeDate(songData.playedAt) }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="postcss" scoped></style>
