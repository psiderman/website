<script setup>
import Description from "./CardDescription.vue";
</script>

<template>
  <div class="card nograyscale group/travel flex flex-col">
    <div class="relative h-full w-full">
      <img
        class="absolute inset-0 h-full w-full object-contain opacity-100 grayscale transition-opacity duration-200 group-hover/travel:opacity-0"
        src="@/assets/images/maps-mono.png"
        alt=""
      /><img
        class="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-200 group-hover/travel:opacity-100"
        src="@/assets/images/maps-color.png"
        alt=""
      />
    </div>
    <Description
      title="Backpacking"
      description="Started as post-COVID restlessness, became a full-fledged hobby."
      icon="backpack"
      flex
    />
  </div>
</template>

<style lang="postcss" scoped>
.nograyscale {
  filter: grayscale(0) !important;
}
</style>
