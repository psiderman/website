<script setup>
import { computed } from "vue";
import client from "@/store/sanity.js";
import imageUrlBuilder from "@sanity/image-url";

function sanityURL(r) {
  if (props.skeleton) return "";
  try {
    const builder = imageUrlBuilder(client);
    return builder.image(r).url();
  } catch (error) {
    console.error(error);
    return "";
  }
}

const props = defineProps({
  images: Array,
  skeleton: { type: Boolean, default: false },
  square: { type: Boolean, default: false },
});

const gridClasses = {
  1: "grid-cols-1 sm:grid-cols-1",
  2: "grid-cols-2 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-3 sm:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-3",
  7: "grid-cols-3 sm:grid-cols-4",
  8: "grid-cols-3 sm:grid-cols-4",
  9: "grid-cols-3 sm:grid-cols-5",
  10: "grid-cols-4 sm:grid-cols-5",
};
</script>

<template>
  <div
    :class="['large grid gap-4', gridClasses[images.length] || 'grid-cols-5']"
  >
    <div
      :class="[
        'anime-entry group/image relative overflow-hidden rounded-lg',
        skeleton ? 'bg-white/5' : 'bg-black',
        square ? 'aspect-square' : 'aspect-long',
      ]"
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
