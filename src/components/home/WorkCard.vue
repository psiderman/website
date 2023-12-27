<script setup>
import Description from "./CardDescription.vue";
</script>

<template>
  <div class="card group/quizizz">
    <div class="relative inset-0 -mt-4 h-full w-full">
      <!-- Logo -->
      <img
        class="absolute inset-0 m-auto"
        src="@/assets/svg/quizizz.svg"
        alt="Quizizz Logo"
      />
      <!-- Figma decor -->
      <div
        class="absolute inset-0 m-auto h-16 w-48 border border-violet-500 opacity-0 transition-opacity duration-500 group-hover/quizizz:opacity-100"
      >
        <div
          class="absolute -left-1 -top-1 h-2 w-2 border border-violet-500 bg-white"
        ></div>
        <div
          class="absolute -right-1 -top-1 h-2 w-2 border border-violet-500 bg-white"
        ></div>
        <div
          class="absolute -bottom-1 -left-1 h-2 w-2 border border-violet-500 bg-white"
        ></div>
        <div
          class="absolute -bottom-1 -right-1 h-2 w-2 border border-violet-500 bg-white"
        ></div>
        <span
          class="absolute -bottom-5 left-0 right-0 mx-auto w-fit rounded-sm bg-violet-500 px-1 text-xs shadow-sm"
          >2019 - 2023</span
        >
        <span
          class="absolute -left-1 -top-5 text-xs font-medium text-violet-500"
          >❖ Product Design at</span
        >
      </div>
    </div>
    <Description
      title="Design Work"
      description="I’ve been a product designer for ≈5y, specializing in desktop design &
        design systems."
    >
      <img src="@/assets/duotone/work.svg" alt="laptop icon" class="h-6" />
    </Description>
  </div>
</template>

<style lang="postcss" scoped>
.card:hover {
  cursor: url("@/assets/svg/figma-arrow.svg"), auto;
}
</style>
