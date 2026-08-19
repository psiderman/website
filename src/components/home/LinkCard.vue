<template>
  <a
    class="card flex aspect-square cursor-pointer flex-col justify-between p-4"
    :href="link"
    target="_blank"
  >
    <div class="flex h-8 w-8 items-center justify-center">
      <img v-if="logo" class="h-8 w-8" :src="urls[logo]" alt="logo" />
      <fa v-if="brand" alt="link icon" :icon="['fab', brand]" :class="['h-6 w-6', color]" />
    </div>
    <span>{{ title }}</span>
    <img
      src="@/assets/duotone/external-link.svg"
      alt="link icon"
      class="absolute top-4 right-4 h-6"
    />
  </a>
</template>

<script setup lang="ts">
const props = defineProps({
  brand: String,
  color: String,
  link: String,
  logo: String,
  title: String,
})

const urls = {
  foursight: new URL('@/assets/images/foursight.png', import.meta.url).toString(),
  owensans: new URL('@/assets/images/owensans.png', import.meta.url).toString(),
  primer: new URL('@/assets/images/primer.png', import.meta.url).toString(),
  spotify: new URL('@/assets/svg/spotify.svg', import.meta.url).toString(),
}
</script>
