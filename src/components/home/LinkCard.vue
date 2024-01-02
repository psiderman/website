<script setup>
const props = defineProps({
  title: String,
  logo: String,
});

const urls = {
  owensans: new URL("@/assets/images/owensans.png", import.meta.url).toString(),
  kiwi: new URL("@/assets/images/kiwi.png", import.meta.url).toString(),
  primer: new URL("@/assets/images/primer.png", import.meta.url).toString(),
  spotify: new URL("@/assets/svg/spotify.svg", import.meta.url).toString(),
};
</script>

<template>
  <div class="card card-small justify-between">
    <div class="h-8 w-8">
      <img class="h-8 w-8" :src="urls[logo]" alt="logo" />
    </div>
    <span>{{ title }}</span>
    <img
      src="@/assets/duotone/external-link.svg"
      alt="link icon"
      class="absolute right-4 top-4 h-6"
    />
  </div>
</template>
