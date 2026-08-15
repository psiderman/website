<template>
  <div
    :class="['large grid gap-4', gridClasses[images.length] || 'grid-cols-5']"
  >
    <div
      v-for="(image, i) in props.images"
      :key="i"
      :class="[
        'anime-entry group/image relative overflow-hidden rounded-lg',
        skeleton ? 'bg-white/5' : 'bg-black',
        square ? 'aspect-square' : 'aspect-long',
      ]"
    >
      <img
        v-if="!skeleton"
        v-lazy="{
          src: image.imageUrl,
          loading: image.metadata.lqip,
        }"
        :class="['h-full w-full cursor-pointer object-cover select-none']"
        :alt="image.caption"
        @click="emits('openGallery', i)"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  images: Array,
  skeleton: { default: false, type: Boolean },
  square: { default: false, type: Boolean },
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
