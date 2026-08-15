<template>
  <div class="absolute inset-0 h-full w-full">
    <!-- Logo -->
    <img
      class="absolute inset-0 m-auto h-12 pl-1.5"
      src="@/assets/svg/dezerv.svg"
      alt="Quizizz Logo"
    />
    <!-- Figma decor -->
    <div
      class="absolute inset-0 m-auto h-16 w-48 border border-violet-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    >
      <div
        class="absolute -top-1 -left-1 h-2 w-2 border border-violet-500 bg-white"
      ></div>
      <div
        class="absolute -top-1 -right-1 h-2 w-2 border border-violet-500 bg-white"
      ></div>
      <div
        class="absolute -bottom-1 -left-1 h-2 w-2 border border-violet-500 bg-white"
      ></div>
      <div
        class="absolute -right-1 -bottom-1 h-2 w-2 border border-violet-500 bg-white"
      ></div>
      <span
        class="absolute right-0 -bottom-5 left-0 mx-auto w-fit rounded-sm bg-violet-500 px-1 text-xs shadow-sm"
        >Feb - Dec 2025</span
      >
      <span class="absolute -top-5 -left-1 text-xs font-medium text-violet-500"
        >❖ Product Design at</span
      >
    </div>
    <img
      class="absolute inset-0 m-auto translate-x-20 translate-y-16 opacity-0 transition-all duration-500 group-hover:translate-x-16 group-hover:translate-y-6 group-hover:opacity-100"
      src="@/assets/svg/figma-arrow.svg"
      alt="arrow"
    />
  </div>
</template>
