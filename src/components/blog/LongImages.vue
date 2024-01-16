<script setup>
const props = defineProps({
  images: Array,
  skeleton: { type: Boolean, default: false },
  square: { type: Boolean, default: false },
});

const emits = defineEmits(["openGallery"]);

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
      v-for="(image, i) in props.images"
      :key="i"
    >
      <img
        v-if="!skeleton"
        :class="['h-full w-full cursor-pointer select-none object-cover']"
        v-lazy="{
          src: image.imageUrl,
          loading: image.metadata.lqip,
        }"
        :alt="image.caption"
        @click="emits('openGallery', i)"
      />
    </div>
  </div>
</template>
