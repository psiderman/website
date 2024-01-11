<script setup>
import { ref } from "vue";
import Description from "./CardDescription.vue";
</script>

<template>
  <div class="card group/work aspect-square">
    <div class="relative inset-0 -mt-4 h-full w-full">
      <div class="absolute inset-0 m-auto h-min w-min">
        <img
          src="@/assets/design/screen-bg.png"
          alt="wp"
          class="absolute inset-0 -z-10 my-auto h-full w-full opacity-0 blur-3xl transition-all duration-500 group-hover/work:animate-pulse group-hover/work:opacity-100"
        />
        <div class="laptop">
          <div class="lid">
            <div class="engraving">PsiderBook Pro</div>
            <div class="screen">
              <img
                src="@/assets/design/screen-bg.png"
                alt="wp"
                class="absolute inset-0 my-auto h-0 w-full transition-all duration-300 ease-in-out group-hover/work:h-full"
              />
              <img
                src="@/assets/design/figma.png"
                alt="figma"
                class="absolute inset-0 m-auto mb-4 h-9 w-9 animate-bounce opacity-0 duration-100 group-hover/work:opacity-100"
              />
            </div>
          </div>
          <div class="base">
            <div class="notch"></div>
            <div class="pad left"></div>
            <div class="pad right"></div>
          </div>
        </div>
      </div>
    </div>
    <Description
      title="Design Portfolio"
      description="I’ve been a product designer for ≈5y, specializing in desktop design & design systems."
      icon="work"
    />
  </div>
</template>

<style lang="postcss" scoped>
.laptop {
}
.lid {
  @apply h-[98px] w-36 overflow-hidden rounded bg-black outline outline-1 outline-gray-700;
}
.engraving {
  @apply flex flex-col items-center justify-center text-[4px] text-white/30;
  @apply absolute bottom-0 left-0 right-0 h-2 w-36 rounded-b bg-black;
  @apply z-10 border-t border-white/10;
}
.screen {
  @apply absolute left-0.5 right-0.5 top-0.5 z-0 overflow-hidden rounded-t-sm bg-cover bg-no-repeat;
  width: 140px;
  height: 89px;
}
.base {
  width: 168px;
  @apply absolute -bottom-1.5 -left-3 z-10 h-2 rounded-b-3xl rounded-t-sm bg-gray-700;
  box-shadow: inset 0px -3px 4px rgba(0, 0, 0, 0.33);
}
.notch {
  height: 5px;
  @apply absolute inset-0 top-0 mx-auto w-10 rounded-b bg-white/10;
  box-shadow:
    inset -1px 0px 1px rgba(0, 0, 0, 0.33),
    inset 1px 0px 1px rgba(0, 0, 0, 0.33);
}
.pad {
  @apply absolute h-px w-2 bg-gray-900;
}
.pad.left {
  @apply -bottom-px left-3;
}
.pad.right {
  @apply -bottom-px right-3;
}
</style>
