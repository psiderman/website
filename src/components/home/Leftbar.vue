<template>
  <div class="left-sticky-bar">
    <!-- Quick intro -->
    <div>
      <!-- DP -->
      <div
        class="leftbar-headshot relative h-16 w-16 rounded-full bg-blue-600 select-none"
      >
        <div
          class="pointer-events-none absolute bottom-0 h-20 w-16 overflow-hidden rounded-b-full align-bottom"
        >
          <img
            class="pointer-events-auto bottom-0 h-20 w-20 cursor-help object-cover select-none"
            src="@/assets/images/dp.png"
            alt="itsame"
            title="It's a me!"
          />
        </div>
      </div>
      <h1 class="leftbar-headshot mt-8 mb-4 text-4xl font-bold">
        Hi, I’m Karan
      </h1>
      <p class="leftbar-headshot text-base font-medium">
        I’m still searching for a one-liner to sum me up, but until then my life
        is a bento box of endless interests, neatly packed for display on my
        ever-evolving personal website.
      </p>
    </div>

    <div class="flex flex-col gap-2 overflow-visible">
      <!-- Socials/External Links -->
      <div class="flex w-full flex-row flex-wrap gap-2 overflow-visible">
        <Pill
          id="email"
          text="hi@psiderman.com"
          icon="envelope"
          @click.prevent="copyEmail"
        />
        <!-- <Pill
          text="Twitter"
          brand="twitter"
          link="https://twitter.com/_psiderman_"
        /> -->
        <Pill
          text="Instagram"
          brand="instagram"
          link="https://instagram.com/psiderman"
        />
        <Pill
          text="Reddit"
          brand="reddit-alien"
          link="https://www.youtube.com/watch?v=xvFZjo5PgG0"
        />
        <Pill
          text="LinkedIn"
          brand="linkedin-in"
          link="https://www.linkedin.com/in/psiderman/"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import anime from "animejs";
import _ from "lodash";

import Pill from "@/components/Pill.vue";

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

      let messageX, messageY;

      const emailElement = document.querySelector("#email");
      const emailRect = emailElement.getBoundingClientRect();
      const scrollYOffset = window.scrollY || window.pageYOffset;

      if (event.x == 0 && event.y == 0) {
        messageX =
          emailRect.x + emailRect.width / 2 - copiedMessage.offsetWidth / 2;
        messageY =
          emailRect.y +
          emailRect.height / 2 -
          copiedMessage.offsetHeight / 2 -
          20 +
          scrollYOffset;
      } else {
        messageX = event.clientX - copiedMessage.offsetWidth / 2;
        messageY =
          event.clientY - copiedMessage.offsetHeight / 2 - 20 + scrollYOffset;
      }

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
        complete: () => {
          document.body.removeChild(copiedMessage);
        },
        duration: _.random(500, 1000),
        easing: "easeOutQuad",
        opacity: {
          duration: 1000,
          easing: "easeInOutSine",
          value: 0,
        },
        rotate: `${plusminus}${rotation}deg`,
        targets: copiedMessage,
        translateX: `${plusminus}=${flingXLength}px`,
        translateY: `-=${flingYLength}px`,
      });
    })
    .catch((error) => {
      console.error("Unable to copy:", error);
      window.location.href = "mailto:hi@psiderman.com";
    });
}
</script>

<style  scoped>
@reference "tailwindcss";
.left-sticky-bar {
  @apply flex w-full shrink-0 flex-col justify-between gap-4 lg:sticky lg:top-20 lg:w-80;
  height: calc(100dvh - 160px);
}

@media (max-width: 1023px) {
  .left-sticky-bar {
    height: auto;
  }
}
</style>
