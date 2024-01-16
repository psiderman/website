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

const props = defineProps({
  galleryData: Array,
  showGallery: { type: Boolean, default: false },
  albumIndex: Number,
  imageIndex: Number,
});

const emits = defineEmits([
  "closeGallery",
  "imageIndexChange",
  "albumIndexChange",
]);

function getRelativeDate(metadata, date) {
  try {
    const d = new Date(metadata.exif.DateTimeOriginal.replace("Z", ""));
    return formatDistance(d, new Date(), { addSuffix: true });
  } catch (error) {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  }
}

const locationString = ref("");
function getLocation(image) {
  try {
    const lat = image.metadata.location.lat;
    const lon = image.metadata.location.lng;

    const geoCodeURL = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lon}&latitude=${lat}&access_token=${
      import.meta.env.VITE_MAPBOX
    }`;

    const query = fetch(geoCodeURL).then(async (response) => {
      const data = await response.json();

      const features = data.features;
      if (features.length > 0) {
        const context = features[0].properties.context || {};
        const { place, region, country } = context;
        const str = [place?.name, region?.name, country?.name]
          .filter(Boolean)
          .join(", ");
        locationString.value = str || "";
      }
    });
    return locationString.value;
  } catch (error) {
    return getTitle(props.galleryData[props.albumIndex]);
  }
}

function getTitle(a) {
  let s;
  if (a.location !== undefined && a.country !== undefined)
    s = a.location + ", " + a.country;
  else s = format(new Date(a.date), "MMMM yyyy");
  return s;
}

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

function currentAlbumChange(c) {
  if (c < 0) {
    emits("albumIndexChange", c);
    emits("imageIndexChange", 0);
  } else {
    emits("albumIndexChange", c);
    emits("imageIndexChange", 0);
  }
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
      currentAlbumChange(-1);
    } else if (swipeDistanceX < -50) {
      currentAlbumChange(1);
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
    v-if="showGallery"
    class="ignore-blog fixed inset-0 z-50 flex h-screen w-screen max-w-none select-none items-center justify-center bg-gray-950 px-4 py-4 sm:pb-2"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <div class="absolute inset-0 z-0" @click="closeGallery()"></div>
    <button
      class="absolute right-2 top-2 hidden rounded bg-white/10 p-1 px-2 text-xs text-white/80 hover:bg-white/20 focus:outline-offset-0 active:bg-white/5 active:outline-none sm:inline-block"
      @click="emits('closeGallery')"
    >
      Close (Esc)
    </button>

    <div
      class="relative inset-0 my-auto h-full rounded-lg bg-white/5 sm:aspect-long"
    >
      <!-- Image -->
      <img
        :class="['h-full w-full select-none rounded-lg object-cover']"
        v-lazy="{
          src: galleryData[albumIndex].images[imageIndex].imageUrl,
          loading: galleryData[albumIndex].images[imageIndex].metadata.lqip,
        }"
        :alt="galleryData[albumIndex].images[imageIndex].caption"
      />

      <!-- Indicator bar -->
      <div class="absolute inset-x-2 top-2 z-10 flex flex-row gap-x-1">
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

      <!-- Meta -->
      <div
        class="absolute inset-x-0 top-0 z-0 flex flex-row gap-x-1 bg-gradient-to-b from-black/50 to-transparent p-2 py-4 pb-8 text-xs"
        style="text-shadow: 0px 0px 8px rgba(0, 0, 0, 0.5)"
      >
        <span class="font-medium text-white">{{
          getLocation(galleryData[albumIndex].images[imageIndex])
        }}</span>
        <span class="text-white/80">{{
          getRelativeDate(
            galleryData[albumIndex].images[imageIndex].metadata,
            galleryData[albumIndex].date,
          )
        }}</span>
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

      <!-- Ghost -->
      <div
        v-if="galleryData[albumIndex + 1]"
        :class="[
          'absolute inset-0 hidden h-full w-full translate-x-full scale-75 cursor-pointer select-none items-center justify-center overflow-hidden rounded-lg sm:flex',
        ]"
        @click="currentAlbumChange(1)"
      >
        <img
          class="absolute h-full w-full object-cover opacity-20"
          v-lazy="{
            src: galleryData[albumIndex + 1].images[0].imageUrl,
            loading: galleryData[albumIndex + 1].images[0].metadata.lqip,
          }"
          :alt="galleryData[albumIndex + 1].images[0].caption"
        />
        <span class="p-4 text-center text-base text-white"
          >{{ getTitle(galleryData[albumIndex + 1]) }}
        </span>
      </div>

      <div
        v-if="galleryData[albumIndex - 1]"
        :class="[
          'absolute inset-0 hidden h-full w-full -translate-x-full scale-75 cursor-pointer select-none items-center justify-center overflow-hidden rounded-lg sm:flex',
        ]"
        @click="currentAlbumChange(-1)"
      >
        <img
          class="absolute h-full w-full object-cover opacity-20"
          v-lazy="{
            src: galleryData[albumIndex - 1].images[0].imageUrl,
            loading: galleryData[albumIndex - 1].images[0].metadata.lqip,
          }"
          :alt="galleryData[albumIndex - 1].images[0].caption"
        />
        <span class="p-4 text-center text-base text-white"
          >{{ getTitle(galleryData[albumIndex - 1]) }}
        </span>
      </div>

      <div
        v-if="galleryData[albumIndex + 2]"
        @click="currentAlbumChange(2)"
        :class="[
          'absolute inset-0 hidden h-full w-full translate-x-[175%] scale-50 cursor-pointer select-none items-center justify-center overflow-hidden rounded-lg sm:flex',
        ]"
      >
        <img
          class="absolute h-full w-full object-cover opacity-20"
          v-lazy="{
            src: galleryData[albumIndex + 2].images[0].imageUrl,
            loading: galleryData[albumIndex + 2].images[0].metadata.lqip,
          }"
          :alt="galleryData[albumIndex + 2].images[0].caption"
        />
        <span class="p-4 text-center text-base text-white"
          >{{ getTitle(galleryData[albumIndex + 2]) }}
        </span>
      </div>

      <div
        v-if="galleryData[albumIndex - 2]"
        @click="currentAlbumChange(-2)"
        :class="[
          'absolute inset-0 hidden h-full w-full -translate-x-[175%] scale-50 cursor-pointer select-none items-center justify-center overflow-hidden rounded-lg sm:flex',
        ]"
      >
        <img
          class="absolute h-full w-full object-cover opacity-20"
          v-lazy="{
            src: galleryData[albumIndex - 2].images[0].imageUrl,
            loading: galleryData[albumIndex - 2].images[0].metadata.lqip,
          }"
          :alt="galleryData[albumIndex - 2].images[0].caption"
        />
        <span class="p-4 text-center text-base text-white"
          >{{ getTitle(galleryData[albumIndex - 2]) }}
        </span>
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
