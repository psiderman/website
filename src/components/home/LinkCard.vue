<script setup>
defineProps({
  title: String,
});
</script>

<template>
  <div class="card card-small">
    <div class="h-8 w-8">
      <slot></slot>
    </div>
    <span>{{ title }}</span>
  </div>
</template>

<style lang="postcss" scoped>
.card-small {
  @apply flex flex-col justify-between p-4;
  height: 140px !important;
}
</style>
