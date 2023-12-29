<script setup>
import { reactive } from "vue";
import { nowData } from "../store/nowData.js";
const data = reactive(nowData);
</script>
<template>
  <h1 class="mb-4">What am I doing now?</h1>
  <p class="-mt-12">
    This is a
    <a href="https://nownownow.com/about" target="_blank" class="underline"
      >/now</a
    >
    page inspired by Derek Sivers.
  </p>
  <template v-for="(now, i) in data" :key="i">
    <div class="large grid select-none grid-cols-4 gap-4">
      <div
        class="anime-entry aspect-long overflow-hidden rounded-lg bg-black outline outline-white/10"
        v-for="image in now.images"
        :key="image.id"
      >
        <img
          :class="[
            'h-full w-full',
            image.contain ? 'object-contain' : 'object-cover',
            image.caption ? 'cursor-help' : '',
          ]"
          v-lazy="image.url"
          :alt="image.caption"
          :title="image.caption"
        />
      </div>
    </div>
    <h2>{{ now.date }}</h2>
    <ul>
      <li v-for="(update, j) in now.updates" :key="j">{{ update }}</li>
    </ul>
  </template>
</template>

<style lang="postcss" scoped></style>
