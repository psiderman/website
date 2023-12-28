<script setup>
import Pill from "@/components/Pill.vue";
import anime from "animejs";
import _ from "lodash";

function copyEmail(event) {
  navigator.clipboard
    .writeText("hi@psiderman.com")
    .then(() => {
      const copiedMessage = document.createElement("span");
      copiedMessage.textContent = "Copied";
      copiedMessage.classList.add(
        "rounded-full",
        "bg-green-600",
        "px-2",
        "py-0",
        "text-base",
        "font-medium",
      );

      document.body.appendChild(copiedMessage);

      const messageX = event.clientX - copiedMessage.offsetWidth / 2;
      const messageY = event.clientY - copiedMessage.offsetHeight / 2 - 20;

      // Set the position for the centered message
      copiedMessage.style.position = "absolute";
      copiedMessage.style.top = `${messageY}px`;
      copiedMessage.style.left = `${messageX}px`;

      const direction = _.random(0, 1);
      const plusminus = direction ? "+" : "-";
      const flingYLength = _.random(20, 50);
      const flingXLength = _.random(0, 50);
      const rotation = _.random(10, 15) * (flingXLength / 50);

      anime({
        targets: copiedMessage,
        translateY: `-=${flingYLength}px`,
        translateX: `${plusminus}=${flingXLength}px`,
        rotate: `${plusminus}${rotation}deg`,
        opacity: {
          value: 0,
          duration: 2000,
          easing: "easeInOutSine",
        },
        duration: _.random(500, 1000),
        easing: "easeOutQuad",
        complete: () => {
          document.body.removeChild(copiedMessage);
        },
      });
    })
    .catch((error) => {
      console.error("Unable to copy:", error);
      window.location.href = "mailto:hi@psiderman.com";
    });
}
</script>

<template>
  <div class="sticky top-0 flex h-full w-80 shrink-0 flex-col justify-between">
    <!-- Quick intro -->
    <div class="flex flex-col gap-y-8">
      <div
        class="leftbar-headshot pointer-events-none relative h-16 w-16 select-none rounded-full bg-blue-600"
      >
        <div
          class="absolute bottom-0 h-20 w-16 overflow-hidden rounded-b-full align-bottom"
        >
          <img
            class="leftbar-dp h-20 w-20 object-cover"
            src="@/assets/images/dp.png"
          />
        </div>
      </div>
      <div class="flex flex-col gap-y-4">
        <h1 class="leftbar-headshot text-4xl font-bold">Hi, I’m Karan</h1>
        <p class="leftbar-headshot text-base font-medium">
          I’m still searching for a one-liner to sum me up, but until then my
          life is a bento box of endless interests, neatly packed for display on
          my ever-evolving personal website.
        </p>
      </div>
    </div>

    <!-- Socials/External Links -->
    <div class="pills flex w-full flex-row flex-wrap gap-2">
      <Pill text="hi@psiderman.com" @click="copyEmail">
        <template v-slot:icon>
          <img src="@/assets/duotone/envelope.svg" />
        </template>
      </Pill>
      <a href="https://twitter.com/_psiderman_" target="_blank">
        <Pill text="Twitter" brand="twitter" />
      </a>
      <a href="https://dribbble.com/psiderman" target="_blank">
        <Pill text="Dribbble" brand="dribbble" />
      </a>
      <a href="https://www.youtube.com/watch?v=xvFZjo5PgG0" target="_blank">
        <Pill text="Reddit" brand="reddit-alien" />
      </a>
      <a href="https://psiderman.read.cv" target="_blank">
        <Pill text="Read.cv" icon="read-cv" />
      </a>
    </div>
  </div>
</template>
