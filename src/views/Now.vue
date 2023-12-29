<script setup>
import { onMounted, ref, nextTick } from "vue";
import { PortableText } from "@portabletext/vue";
import anime from "animejs";
import client from "@/store/sanity.js";
import LongImages from "@/components/blog/LongImages.vue";

const data = ref(null);

onMounted(async () => {
  try {
    const query = '*[_type == "now"]';
    const response = await client.fetch(query);
    data.value = response;

    nextTick(() => {
      anime({
        targets: [".anime-entry, h1, h2, h3, p, ul, li, span"],
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
    <a href="https://nownownow.com/about" target="_blank" class="underline"
      >/now</a
    >
    page inspired by Derek Sivers.
  </p>
  <template v-for="now in data" :key="now._id">
    <LongImages :images="now.images" />
    <h2>{{ now.date }}</h2>
    <PortableText :value="now.updates" />
  </template>
</template>
