<script setup>
const props = defineProps({
  title: String,
  logo: String,
});

const urls = {
  owensans: new URL("@/assets/images/owensans.png", import.meta.url).toString(),
  kiwi: new URL("@/assets/images/kiwi.png", import.meta.url).toString(),
  primer: new URL("@/assets/images/primer.png", import.meta.url).toString(),
};
</script>

<template>
  <div class="card card-small">
    <div class="h-8 w-8">
      <img :src="urls[logo]" alt="logo" />
    </div>
    <span>{{ title }}</span>
    <img
      src="@/assets/duotone/external-link.svg"
      alt="link icon"
      class="absolute right-4 top-4 h-6"
    />
  </div>
</template>

<style lang="postcss" scoped>
.card-small {
  @apply flex flex-col justify-between p-4;
  height: 140px !important;
}
</style>
