<script setup>
import { onMounted, ref, nextTick } from "vue";
import anime from "animejs";
import client from "@/store/sanity.js";
import LongImages from "@/components/blog/LongImages.vue";
import Gallery from "@/components/blog/Gallery.vue";

const data = ref(null);
const loading = ref(true);

onMounted(async () => {
  anime({
    targets: [".anime-entry, h1, h2, h3, p, span"],
    translateY: ["1rem", "0"],
    opacity: [0, 1],
    scale: [0.95, 1],
    transformOrigin: "center",
    duration: 500,
    easing: "easeOutBack",
    delay: anime.stagger(100),
  });
  try {
    const query =
      '*[_type == "travel"] | order(date desc) { ..., images[] { ..., "imageUrl": asset->url, "metadata": asset->metadata } }';
    const response = await client.fetch(query);
    data.value = response;
    nextTick(() => {
      loading.value = false;
      anime({
        targets: [
          ".sanity .anime-entry, .sanity h1, .sanity h2, .sanity h3, .sanity p, .sanity ul, .sanity li, .sanity span",
        ],
        translateY: ["1rem", "0"],
        opacity: [0, 1],
        scale: [0.95, 1],
        transformOrigin: "center",
        duration: 500,
        easing: "easeOutBack",
        delay: anime.stagger(100),
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

const showGallery = ref(false);
const albumIndex = ref(0);
const imageIndex = ref(0);

function galleryToggle(f, j = 0, i = 0) {
  albumIndex.value = i;
  imageIndex.value = j;
  showGallery.value = f;
}

function updateImageIndex(i) {
  if (i < 0) imageIndex.value = data.value[albumIndex.value].images.length - 1;
  else imageIndex.value = i;
}

function updateAlbumIndex(i) {
  if (i < 0)
    if (albumIndex.value == 0) galleryToggle(false);
    else albumIndex.value += i;
  else {
    if (albumIndex.value == data.value.length - 1) galleryToggle(false);
    else albumIndex.value += i;
  }
}
</script>
<template>
  <h1 class="mb-4">You don't need more than /r/onebag</h1>
  <p>
    This isn't my most recent setup, but it's the most recent picture. I started
    my 62 day SEA trip with this setup. The overall weight is 9kgs, of which the
    laptop is 1.5kgs. Of course, I made a
    <a
      href="https://docs.google.com/spreadsheets/d/1qaqdf6zLSnEwbf700jZxeuDoB4JNATjNvUZObxbKWxE/edit?usp=sharing"
      class="underline underline-offset-4"
      target="_blank"
      >spreadsheet</a
    >. When I pack and dress smartly, I can bring the weight to under 7kgs.
  </p>
  <p>
    Besides the obvious benefits of not lugging around luggage, I also love that
    I've finally trimmed down to all plain black tees (not pictured).
  </p>

  <div
    class="anime-entry aspect-square h-full w-full overflow-hidden rounded-lg bg-black"
  >
    <img
      class="aspect-square h-full w-full select-none object-contain"
      src="@/assets/images/bag.jpeg"
      title="one bag setup"
      alt="one bag setup"
    />
  </div>
  <p class="caption">
    You can learn more about
    <a
      href="https://www.reddit.com/r/onebag/wiki/index/#wiki_what_is_onebag.3F"
      target="_blank"
      class="underline underline-offset-2"
      >one bagging</a
    >
    here
  </p>
  <h1 title="log, get it?" class="cursor-help">Travel 🪵</h1>
  <div class="large" v-if="loading">
    <div class="w640">
      <div
        class="anime-entry skeleton-shimmer mb-8 mt-16 h-8 w-64 overflow-hidden rounded-lg bg-white/5"
      ></div>
      <div
        class="anime-entry skeleton-shimmer my-8 h-16 w-full overflow-hidden rounded-lg bg-white/5"
      ></div>
    </div>
    <LongImages
      :skeleton="true"
      :images="[
        { id: 1, asset: { _ref: '' } },
        { id: 2, asset: { _ref: '' } },
        { id: 3, asset: { _ref: '' } },
        { id: 4, asset: { _ref: '' } },
      ]"
    />
  </div>
  <div class="sanity large">
    <template v-for="(travel, i) in data" :key="travel._id">
      <h2>{{ travel.location }}, {{ travel.country }}</h2>
      <p>{{ travel.description }}</p>
      <LongImages
        :images="travel.images"
        :title="travel.location"
        :fullDate="travel.date"
        @openGallery="galleryToggle(true, $event, i)"
      />
    </template>
  </div>

  <Gallery
    v-if="!loading"
    :showGallery="showGallery"
    :galleryData="data"
    :albumIndex="albumIndex"
    :imageIndex="imageIndex"
    @closeGallery="galleryToggle(false)"
    @imageIndexChange="updateImageIndex($event)"
    @albumIndexChange="updateAlbumIndex($event)"
  />
</template>
