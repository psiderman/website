<script setup>
import { format, formatDistance } from "date-fns";
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  defineProps,
  defineEmits,
  watch,
} from "vue";
import client from "@/store/sanity.js";
import imageUrlBuilder from "@sanity/image-url";

const props = defineProps({
  galleryData: Array,
  showGallery: { type: Boolean, default: false },
  albumIndex: Number,
  imageIndex: Number,
  titleKey: String,
});

const emits = defineEmits([
  "closeGallery",
  "imageIndexChange",
  "albumIndexChange",
]);

const sanityURL = (r) =>
  props.skeleton ? "" : imageUrlBuilder(client).image(r).url();

const title = computed(() =>
  props.titleKey === "date"
    ? format(
        new Date(props.galleryData[props.albumIndex][props.titleKey]),
        "MMMM yyyy",
      )
    : props.galleryData[props.albumIndex].location +
      ", " +
      props.galleryData[props.albumIndex].country,
);

const relativeDate = computed(() => {
  try {
    return formatDistance(
      new Date(props.galleryData[props.albumIndex].date),
      new Date(),
      { addSuffix: true },
    );
  } catch (error) {
    return "";
  }
});

const timer = ref(null);
const slideShowTimerValue = ref(5000);

function currentIndexChange(c) {
  clearInterval(timer.value);
  const l = props.galleryData[props.albumIndex].images.length;
  if (c < 0) {
    if (props.imageIndex == 0) {
      emits("albumIndexChange", -1);
      emits("imageIndexChange", -1);
    } else {
      emits("imageIndexChange", props.imageIndex + c);
    }
  } else {
    if (props.imageIndex == l - 1) {
      emits("albumIndexChange", 1);
      emits("imageIndexChange", 0);
    } else {
      emits("imageIndexChange", props.imageIndex + c);
    }
  }
  timer.value = setInterval(() => {
    currentIndexChange(1);
  }, slideShowTimerValue.value);
}

function closeGallery() {
  clearInterval(timer.value);
  emits("closeGallery");
}

// Touch Event Handling
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const handleTouchStart = (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
};

const handleTouchEnd = (event) => {
  touchEndX = event.changedTouches[0].clientX;
  touchEndY = event.changedTouches[0].clientY;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeDistanceX = touchEndX - touchStartX;
  const swipeDistanceY = touchEndY - touchStartY;

  if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
    if (swipeDistanceX > 50) {
      emits("albumIndexChange", -1);
      emits("imageIndexChange", 0);
    } else if (swipeDistanceX < -50) {
      emits("albumIndexChange", 1);
      emits("imageIndexChange", 0);
    }
  } else {
    if (swipeDistanceY > 50) {
      closeGallery();
    } else if (swipeDistanceY < -50) {
    }
  }
};

onMounted(() => {
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Escape":
        closeGallery();
        break;
      case "ArrowRight":
        currentIndexChange(1);
        break;
      case "ArrowLeft":
        currentIndexChange(-1);
        break;
      default:
        break;
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
});

watch(
  () => props.showGallery,
  (o, n) => {
    if (props.showGallery) {
      timer.value = setInterval(() => {
        currentIndexChange(1);
      }, slideShowTimerValue.value);
    } else {
      clearInterval(timer.value);
    }
  },
);
</script>

<template>
  <div
    v-show="showGallery"
    class="ignore-blog fixed inset-0 z-50 flex h-screen w-screen max-w-none select-none items-center justify-center bg-gray-950 px-4 pb-4 pt-8 sm:pb-2 sm:pt-6"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <button
      class="absolute right-2 top-2 hidden rounded bg-white/10 p-1 px-2 text-xs text-white/80 hover:bg-white/20 focus:outline-offset-0 active:bg-white/5 active:outline-none sm:inline-block"
      @click="emits('closeGallery')"
    >
      Close (Esc)
    </button>

    <div
      class="relative inset-0 my-auto h-full rounded-lg bg-white/5 sm:aspect-long"
    >
      <!-- Meta -->
      <div class="absolute -top-5 flex w-full flex-row justify-between text-xs">
        <span class="w-full grow truncate font-medium">{{ title }}</span>
        <span class="shrink-0 text-white/80"> {{ relativeDate }} </span>
      </div>

      <!-- Image -->
      <img
        :class="['h-full w-full select-none rounded-lg object-cover']"
        v-lazy="
          sanityURL(galleryData[albumIndex].images[imageIndex].asset._ref)
        "
        :alt="galleryData[albumIndex].images[imageIndex].caption"
      />

      <!-- Indicator bar -->
      <div class="absolute inset-x-2 top-2 flex flex-row gap-x-1">
        <div
          v-for="(img, j) in galleryData[albumIndex].images"
          :key="j"
          :class="['h-0.5 w-full overflow-hidden rounded-lg bg-white/50 ']"
        >
          <div
            :class="[
              'h-full w-full rounded-lg',
              j < imageIndex ? 'bg-white' : 'bg-transparent',
            ]"
          >
            <div
              :class="[
                'h-full w-0 rounded bg-white',
                j == imageIndex ? 'progress-bar-increase' : '',
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- Caption -->
      <div
        v-if="galleryData[albumIndex].images[imageIndex].caption"
        class="absolute inset-x-0 bottom-0 p-2 text-xs sm:text-base"
      >
        <span class="bg-black p-1 py-px leading-5">
          {{ galleryData[albumIndex].images[imageIndex].caption }}
        </span>
      </div>

      <!-- Navigation -->
      <div class="absolute inset-0 flex flex-row">
        <div
          class="h-full w-full cursor-pointer rounded-l-lg"
          @click="currentIndexChange(-1)"
        ></div>
        <div class="h-full w-full"></div>
        <div
          class="h-full w-full cursor-pointer rounded-r-lg"
          @click="currentIndexChange(1)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.progress-bar-increase {
  animation: pb 5000ms linear forwards;
}
@keyframes pb {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>
