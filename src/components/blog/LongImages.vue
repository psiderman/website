<script setup>
import { computed } from "vue";
import client from "@/store/sanity.js";
import imageUrlBuilder from "@sanity/image-url";

function sanityURL(r) {
  const builder = imageUrlBuilder(client);
  return builder.image(r).url();
}

const props = defineProps({
  images: Array,
});

const gridClasses = {
  1: "grid-cols-1 lg:grid-cols-1",
  2: "grid-cols-2 lg:grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-3 lg:grid-cols-3",
  7: "grid-cols-3 lg:grid-cols-4",
  8: "grid-cols-3 lg:grid-cols-4",
  9: "grid-cols-3 lg:grid-cols-5",
  10: "grid-cols-4 lg:grid-cols-5",
};
</script>

<template>
  <div
    :class="['large grid gap-4', gridClasses[images.length] || 'grid-cols-5']"
  >
    <div
      class="anime-entry group/image relative aspect-long overflow-hidden rounded-lg bg-black"
      v-for="image in props.images"
      :key="image.id"
    >
      <img
        :class="[
          'h-full w-full select-none',
          image.contain ? 'object-contain' : 'object-cover',
          image.caption ? 'cursor-help' : 'object-cover',
        ]"
        v-lazy="sanityURL(image.asset._ref)"
        :alt="image.caption"
        :title="image.caption"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.group\/image::before {
  content: url(@/assets/duotone/image.svg);
  @apply absolute left-1/2 top-1/2 -z-10  -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-20;
}
</style>
