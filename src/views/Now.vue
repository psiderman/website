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
    targets: [".anime-entry, h1, h2, h3, p, li, span"],
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
      '*[_type == "now"] | order(date desc) { ..., images[] { ..., "imageUrl": asset->url, "metadata": asset->metadata } }';
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
  <div class="large" v-if="loading">
    <div class="w640">
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
    <h1 class="mb-4">
      What am I doing
      <a
        href="https://nownownow.com/about"
        target="_blank"
        class="underline underline-offset-2"
      >
        now</a
      >
      ?
    </h1>
    <template v-for="(now, i) in data" :key="now._id">
      <LongImages
        :images="now.images"
        :title="now.location"
        :fullDate="now.date"
        @openGallery="galleryToggle(true, $event, i)"
      />
      <div class="h-10 w-full"></div>
      <p class="italic">
        Last updated:
        {{
          new Intl.DateTimeFormat("en-US", {
            month: "short",
            year: "numeric",
          }).format(new Date(now.date))
        }}
      </p>
      <ul>
        <template v-for="(update, i) in now.updates" :key="i">
          <li v-for="(child, i) in update.children" :key="i">
            {{ child.text }}
          </li>
        </template>
      </ul>
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
