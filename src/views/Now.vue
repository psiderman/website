<script setup>
import { reactive } from "vue";
import { nowData } from "../store/nowData.js";
import LongImages from "@/components/blog/LongImages.vue";

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
    <LongImages :images="now.images" />
    <h2>{{ now.date }}</h2>
    <ul>
      <li v-for="(update, j) in now.updates" :key="j">{{ update }}</li>
    </ul>
  </template>
</template>
