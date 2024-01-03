<script setup>
import "@/assets/blog.css";
import { ref, onMounted } from "vue";
import { useStore } from "@/store/store";
import { useRoute, useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import anime from "animejs";

const store = useStore();
const route = useRoute();
const router = useRouter();
const cutStatus = ref(false);

function verify() {
  store.cutCorners = true;
  router.replace(route.query.p);
}

function cut() {
  if (cutStatus.value) return;
  anime({
    targets: ".dottedLine",
    opacity: [1, 0],
    duration: 100,
  });
  anime({
    targets: ".corner",
    rotate: "-3deg",
    translateX: "-10px",
    translateY: "6px",
    duration: 500,
    easing: "easeInOutQuad",
  });
  const status = document.querySelector("p.status");
  status.innerHTML = `Now we're both cutting corners, and you know why the website works best on desktop.`;
  const h1 = document.querySelector("h1");
  h1.innerHTML = `You're human.`;
  anime({
    targets: "p.status, h1, button",
    translateY: ["1rem", "0"],
    opacity: [0, 1],
    scale: [0.95, 1],
    transformOrigin: "center",
    duration: 500,
    easing: "easeOutBack",
    delay: anime.stagger(100, { start: 500 }),
  });
  cutStatus.value = true;
}
onMounted(async () => {
  anime({
    targets: [".anime-entry, h1, h2, h3, p, span"],
    translateY: ["1rem", "0"],
    opacity: [0, 1],
    scale: [0.95, 1],
    transformOrigin: "center",
    duration: 500,
    easing: "easeOutBack",
    delay: anime.stagger(100),
  });
});
</script>
<template>
  <div
    class="flex h-screen w-full select-none flex-col items-center justify-between p-10"
  >
    <img
      src="@/assets/svg/psider.svg"
      alt="logo"
      class="anime-entry h-16 w-16 select-none"
    />
    <div class="flex w-screen max-w-xs flex-col">
      <h1 class="px-8 text-center text-2xl font-semibold text-white">
        Prove you are human
      </h1>
      <div class="anime-entry relative cursor-pointer px-8 py-4">
        <div class="absolute bottom-2 left-4 z-50 h-32 w-32" @click="cut"></div>
        <div class="relative">
          <img
            class="pointer-events-none"
            src="@/assets/images/paper.png"
            alt="paper"
          />
          <img
            class="corner pointer-events-none absolute inset-0"
            src="@/assets/images/corner.png"
            alt="corner"
          />
          <div class="dottedLine pointer-events-none absolute flex h-0.5 gap-2">
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
            <div class="5 w-2 bg-gray-900"></div>
          </div>
        </div>
      </div>
      <p class="status px-8 text-center text-base text-white">
        Tap your finger on the dotted line to make a cut. <br /><br />
      </p>
      <p></p>
    </div>
    <div v-show="!cutStatus" class="h-11"></div>
    <Button
      class="w-full justify-center"
      v-show="cutStatus"
      text="Enter"
      icon="arrow-right"
      @click="verify"
    />
    <div></div>
  </div>
</template>

<style lang="postcss" scoped>
.dottedLine {
  left: -30px;
  bottom: 44.5px;
  transform-origin: center center;
  rotate: 50deg;
}
</style>
