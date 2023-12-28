<script setup>
import { ref } from "vue";
import Description from "./CardDescription.vue";

const eyes = ref(null);

function moveEye(event) {
  const eyesUI = eyes.value;
  const eyeballs = eyesUI.querySelectorAll(".eyeball");
  const eyesRect = eyesUI.getBoundingClientRect();

  const eyesCenterX = eyesRect.left + eyesRect.width / 2;
  const eyesCenterY = eyesRect.top + eyesRect.height / 2;

  const mouseX = event.clientX;
  const mouseY = event.clientY;

  const angle = Math.atan2(mouseY - eyesCenterY, mouseX - eyesCenterX);

  const distanceX = Math.cos(angle) * 6;
  const distanceY = Math.sin(angle) * 20;

  eyeballs.forEach((eyeball) => {
    const pupil = eyeball.querySelector(".pupil");
    const dX = Math.cos(angle) * 1;
    const dY = Math.sin(angle) * 1;
    eyeball.style.transform = `translate(${distanceX}px, ${distanceY}px)`;
    pupil.style.transform = `translate(${dX}px, ${dY}px)`;
  });
}

function resetEye() {
  const eyesUI = eyes.value;
  const eyeballs = eyesUI.querySelectorAll(".eyeball");

  eyeballs.forEach((eyeball) => {
    const pupil = eyeball.querySelector(".pupil");
    eyeball.classList.add("transition-all", "duration-500");
    eyeball.style.transform = "translate(-6px, 0)";
    pupil.style.transform = `translate(0px, 0px)`;
    setTimeout(() => {
      eyeball.classList.remove("transition-all", "duration-500");
    }, 500);
  });
}
</script>

<template>
  <div class="card group/now" @mousemove="moveEye" @mouseleave="resetEye">
    <div class="relative inset-0 -mt-4 h-full w-full">
      <div
        class="absolute inset-0 m-auto flex h-fit w-fit flex-row gap-2"
        ref="eyes"
      >
        <div class="sclera">
          <div class="eyeball">
            <div class="pupil"></div>
            <div class="shine"></div>
          </div>
        </div>
        <div class="sclera">
          <div class="eyeball">
            <div class="pupil"></div>
            <div class="shine"></div>
          </div>
        </div>
      </div>
    </div>
    <Description
      title="See what I'm up to ‘Now’"
      description="I’ll create an about page when I fill up Google Search results. For now
        there’s, well... now."
      icon="../../assets/duotone/now.svg"
    />
  </div>
</template>

<style lang="postcss" scoped>
.sclera {
  @apply relative h-14 w-8 overflow-hidden bg-white;
  border-radius: 50% / 50%;
  box-shadow:
    0px 0px 3px 1px rgba(0, 0, 0, 0.25) inset,
    0px 0px 4px 2px rgba(0, 0, 0, 0.1) inset;
}

.eyeball {
  @apply absolute inset-0 m-auto h-5 w-[19px] rounded-full border-[0.5px] border-black/20;
  background: linear-gradient(138deg, #372a28 0%, #76514b 100%);
  transform: translateX(-6px);
}

.pupil {
  @apply absolute inset-0 m-auto h-3 w-3 rounded-full bg-gray-800;
  box-shadow: 0px 0px 2px 1px #18181b inset;
}

.shine {
  @apply absolute left-px top-[3px] h-1.5 w-1 rotate-[30deg] rounded-full bg-white blur-[1px];
}
</style>
