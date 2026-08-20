<template>
  <div
    class="bg-surface-primary noscrollbar relative flex h-full w-full snap-x snap-mandatory flex-row gap-2 overflow-scroll"
  >
    <GenericLoader v-if="loading" theme="light" />
    <template v-else>
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="group border-border-primary relative shrink-0 cursor-pointer snap-start snap-always overflow-hidden rounded-lg border"
        @click="handleClick(movie.link)"
      >
        <img :src="movie.cover" :alt="`poster for ${movie.title}`" class="h-full w-auto" />
        <div
          class="bg-overlay text-p absolute inset-0 flex flex-col justify-between rounded-lg p-3 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100"
        >
          <p class="text-text-inverted-primary line-clamp-8 text-ellipsis whitespace-pre-wrap">
            “{{ movie.review }}”
          </p>
          <div v-if="movie.rating !== null" class="flex h-6 w-full flex-row gap-1">
            <img
              v-for="(star, index) in getStars(movie.rating)"
              :key="index"
              :src="star"
              alt="star"
              class="h-6 w-6"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import starHalf from '@/assets/svg/star-0.5.svg'
import starFull from '@/assets/svg/star-1.svg'
import { supabase } from '@/supabase'

import GenericLoader from '../GenericLoader.vue'

interface Movie {
  cover: string
  id: string
  link: null | string
  rating: null | number
  review: null | string
  title: string
  watched_date: string
}

function getStars(rating: null | number) {
  const stars = []
  const r = rating || 0
  for (let i = 1; i <= 5; i++) {
    if (r >= i) stars.push(starFull)
    else if (r >= i - 0.5) stars.push(starHalf)
  }
  return stars
}

const movies = ref<Movie[]>([])
const loading = ref(true)
const error = ref<null | string>(null)

onMounted(async () => {
  try {
    const { data, error: err } = await supabase
      .from('movies')
      .select('*')
      .order('watched_date', { ascending: false })
      .limit(8)

    if (err) throw err

    movies.value = data
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

const handleClick = (link: null | string) => {
  if (link) {
    window.open(link, '_blank')
  }
}
</script>

<style scoped></style>
