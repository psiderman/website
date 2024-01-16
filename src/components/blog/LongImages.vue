<script setup>
import { computed, onMounted, ref, onUnmounted } from "vue";
import client from "@/store/sanity.js";
import imageUrlBuilder from "@sanity/image-url";
import Button from "@/components/Button.vue";
import { formatDistance, parse } from "date-fns";

function sanityURL(r) {
  if (props.skeleton) return "";
  try {
    const builder = imageUrlBuilder(client);
    return builder.image(r).url();
  } catch (error) {
    console.error(error);
    return "";
  }
}

const props = defineProps({
  images: Array,
  title: String,
  fullDate: { type: String, default: "2023-12-31" },
  skeleton: { type: Boolean, default: false },
  square: { type: Boolean, default: false },
});

const gridClasses = {
  1: "grid-cols-1 sm:grid-cols-1",
  2: "grid-cols-2 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-3 sm:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-3",
  7: "grid-cols-3 sm:grid-cols-4",
  8: "grid-cols-3 sm:grid-cols-4",
  9: "grid-cols-3 sm:grid-cols-5",
  10: "grid-cols-4 sm:grid-cols-5",
};

const showGallery = ref(false);
const currentIndex = ref(0);
const relativeDate = computed(() => {
  try {
    return formatDistance(
      parse(props.fullDate, "yyyy-MM-dd", new Date()),
      new Date(),
      {
        addSuffix: true,
      },
    );
  } catch (error) {
    return "";
  }
});

function currentIndexChange(c) {
  const i = props.images.length;
  currentIndex.value = (currentIndex.value + c + i) % i;
}

function galleryToggle(f, i = 0) {
  if (props.skeleton) return;
  const app = document.querySelector("body");
  if (f) app.classList.add("overflow-hidden");
  else app.classList.remove("overflow-hidden");
  showGallery.value = f;
  currentIndex.value = i;
}
// Touch Event Handling
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX;
  touchEndY = event.changedTouches[0].clientY;
  handleSwipe();
}

function handleSwipe() {
  const swipeDistanceX = touchEndX - touchStartX;
  const swipeDistanceY = touchEndY - touchStartY;

  if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
    if (swipeDistanceX > 50) {
      // currentIndexChange(-1); // Swipe right
    } else if (swipeDistanceX < -50) {
      // currentIndexChange(1); // Swipe left
    }
  } else {
    if (swipeDistanceY > 50) {
      galleryToggle(false);
    } else if (swipeDistanceY < -50) {
    }
  }
}

onMounted(() => {
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      galleryToggle(false);
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
});
</script>

<template>
  <div
    :class="['large grid gap-4', gridClasses[images.length] || 'grid-cols-5']"
  >
    <div
      :class="[
        'anime-entry group/image relative overflow-hidden rounded-lg',
        skeleton ? 'bg-white/5' : 'bg-black',
        square ? 'aspect-square' : 'aspect-long',
      ]"
      v-for="(image, i) in props.images"
      :key="i"
    >
      <img
        :class="[
          'h-full w-full cursor-pointer select-none',
          image.contain ? 'object-contain' : 'object-cover',
        ]"
        v-lazy="sanityURL(image.asset._ref)"
        :alt="image.caption"
        @click="galleryToggle(true, i)"
      />
    </div>
  </div>

  <div
    class="fixed inset-x-0 bottom-0 top-0 z-50 flex h-screen w-screen select-none items-center justify-center bg-gray-950 px-4 pb-4 pt-8 sm:pb-2 sm:pt-6"
    v-show="showGallery"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <button
      class="absolute right-2 top-2 hidden rounded bg-white/10 p-1 px-2 text-xs text-white/80 hover:bg-white/20 focus:outline-offset-0 active:bg-white/5 active:outline-none sm:inline-block"
      @click="galleryToggle(false)"
    >
      Close (Esc)
    </button>

    <div
      class="relative inset-0 my-auto h-full rounded-lg bg-white/5 sm:aspect-long"
    >
      <!-- Meta -->
      <div class="absolute -top-5 flex w-full flex-row justify-between text-xs">
        <span class="font-medium">{{ title }}</span>
        <span class="text-white/80"> {{ relativeDate }} </span>
      </div>

      <!-- Image -->
      <img
        :class="[
          'h-full w-full select-none rounded-lg',
          images[currentIndex].contain ? 'object-contain' : 'object-cover',
        ]"
        v-lazy="sanityURL(images[currentIndex].asset._ref)"
        :alt="images[currentIndex].caption"
      />

      <!-- Indicator bar -->
      <div class="absolute inset-x-2 top-2 flex flex-row gap-x-2">
        <div
          v-for="(img, i) in images"
          :key="i"
          :class="['h-0.5 w-full overflow-hidden rounded-lg bg-white/50']"
        >
          <div
            :class="[
              'h-full w-full rounded-lg',
              i <= currentIndex ? 'bg-white' : 'bg-transparent',
            ]"
          ></div>
        </div>
      </div>

      <!-- Caption -->
      <div
        v-if="images[currentIndex].caption"
        class="absolute inset-x-0 bottom-0 p-2 text-xs"
      >
        <span class="bg-black p-1 py-px leading-5">
          {{ images[currentIndex].caption }}
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
