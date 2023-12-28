<script setup>
const props = defineProps({
  title: String,
  logo: String,
});

function getImageUrl() {
  return new URL(props.logo, import.meta.url).toString();
}
</script>

<template>
  <div class="card card-small">
    <div class="h-8 w-8">
      <img :src="getImageUrl()" alt="logo" />
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
