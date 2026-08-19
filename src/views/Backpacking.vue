<template>
  <h1 class="mb-4">Backpacking</h1>
  <div v-if="loading" class="large">
    <div class="w640">
      <div
        class="anime-entry skeleton-shimmer mt-16 mb-8 h-8 w-64 overflow-hidden rounded-lg bg-white/5"
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
        :full-date="travel.date"
        @open-gallery="galleryToggle(true, $event, i)"
      />
    </template>
  </div>

  <Gallery
    v-if="!loading"
    :show-gallery="showGallery"
    :gallery-data="data"
    :album-index="albumIndex"
    :image-index="imageIndex"
    @close-gallery="galleryToggle(false)"
    @image-index-change="updateImageIndex($event)"
    @album-index-change="updateAlbumIndex($event)"
  />
</template>

<script setup lang="ts">
import anime from 'animejs'
import { nextTick, onMounted, ref } from 'vue'

import Gallery from '@/components/blog/Gallery.vue'
import LongImages from '@/components/blog/LongImages.vue'
import client from '@/store/sanity.js'

const data = ref(null)
const loading = ref(true)

onMounted(async () => {
  anime({
    delay: anime.stagger(100),
    duration: 500,
    easing: 'easeOutBack',
    opacity: [0, 1],
    scale: [0.95, 1],
    targets: ['.anime-entry, h1, h2, h3, p, span'],
    transformOrigin: 'center',
    translateY: ['1rem', '0'],
  })
  try {
    const query =
      '*[_type == "travel"] | order(date desc) { ..., images[] { ..., "imageUrl": asset->url, "metadata": asset->metadata } }'
    const response = await client.fetch(query)
    data.value = response
    nextTick(() => {
      loading.value = false
      anime({
        delay: anime.stagger(100),
        duration: 500,
        easing: 'easeOutBack',
        opacity: [0, 1],
        scale: [0.95, 1],
        targets: [
          '.sanity .anime-entry, .sanity h1, .sanity h2, .sanity h3, .sanity p, .sanity ul, .sanity li, .sanity span',
        ],
        transformOrigin: 'center',
        translateY: ['1rem', '0'],
      })
    })
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

const showGallery = ref(false)
const albumIndex = ref(0)
const imageIndex = ref(0)

function galleryToggle(f, j = 0, i = 0) {
  albumIndex.value = i
  imageIndex.value = j
  showGallery.value = f
}

function updateAlbumIndex(i) {
  if (i < 0)
    if (albumIndex.value == 0) galleryToggle(false)
    else albumIndex.value += i
  else {
    if (albumIndex.value == data.value.length - 1) galleryToggle(false)
    else albumIndex.value += i
  }
}

function updateImageIndex(i) {
  if (i < 0) imageIndex.value = data.value[albumIndex.value].images.length - 1
  else imageIndex.value = i
}
</script>
