<script setup>
import { onMounted, ref, nextTick } from "vue";
import { format } from "date-fns";
import { PortableText } from "@portabletext/vue";
import anime from "animejs";
import client from "@/store/sanity.js";
import LongImages from "@/components/blog/LongImages.vue";

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
    const query = '*[_type == "now"] | order(date desc)';
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
</script>
<template>
  <h1 class="mb-4">What am I doing now?</h1>
  <p class="-mt-12">
    This is a
    <a
      href="https://nownownow.com/about"
      target="_blank"
      class="underline underline-offset-4"
      >/now</a
    >
    page inspired by Derek Sivers.
  </p>
  <div class="large" v-if="loading">
    <LongImages
      :skeleton="true"
      :images="[
        { id: 1, asset: { _ref: '' } },
        { id: 2, asset: { _ref: '' } },
        { id: 3, asset: { _ref: '' } },
        { id: 4, asset: { _ref: '' } },
      ]"
    />
    <div class="w640">
      <div
        class="anime-entry skeleton-shimmer mb-8 mt-16 h-8 w-64 overflow-hidden rounded-lg bg-white/5"
      ></div>
      <div
        class="anime-entry skeleton-shimmer my-8 h-16 w-full overflow-hidden rounded-lg bg-white/5"
      ></div>
      <div
        class="anime-entry skeleton-shimmer my-8 h-16 w-full overflow-hidden rounded-lg bg-white/5"
      ></div>
      <div
        class="anime-entry skeleton-shimmer my-8 h-16 w-full overflow-hidden rounded-lg bg-white/5"
      ></div>
    </div>
  </div>
  <div class="sanity large">
    <template v-for="now in data" :key="now._id">
      <LongImages :images="now.images" />
      <h2>{{ format(new Date(now.date), "MMMM dd, yyyy") }}</h2>
      <PortableText :value="now.updates" />
    </template>
  </div>
</template>
