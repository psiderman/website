<template>
  <div class="w640 anime-entry mb-6">
    <img
      src="@/assets/svg/dezerv.svg"
      alt="Quizizz Logo"
      class="-ml-2 h-10 w-[120px]"
    />
    <h1 class="hidden">Quizizz</h1>
  </div>
  <p>
    Dezerv is a wealth management platform managing ₹15,000+ Crores for its
    clients. I joined as a Senior Product Designer. Dezerv's Wealth Monitor
    product tracks your investments across different assets, I started my
    contribution to the product by designing the experience for letting users
    track their National Pension Scheme on the Dezerv App.
  </p>
  <p>
    After that, I rebuilt the design infrastructure connecting four fragmented
    products, then used it to ship Dezerv Web, a desktop platform used by both
    clients and Relationship Managers.
  </p>

  <!-- Prosper -->
  <h2>Building Prosper</h2>
  <p>
    Four products, three-plus codebases, two color schemes, zero shared
    vocabulary. I rebuilt Dezerv's design foundations from the ground up — one
    token system, one typography scale, one icon system — and the plugin
    pipeline that kept it in sync with engineering.
    <a
      class="text-blue-400 underline underline-offset-4"
      href="https://psiderman.notion.site/Building-Prosper-39b7c0b161b3804abc6fe34b73f48586"
      target="_blank"
      >Read more here.</a
    >
  </p>

  <img v-lazy="imageData.prosper" class="anime-entry gallery-image" />

  <!-- Dezerv Web -->

  <h2>Dezerv Web</h2>
  <p>
    Dezerv paid a multi-crore license every year for a third-party desktop tool
    built for the average wealth manager. I replaced it with a desktop
    experience built on Dezerv's own design language — shipped after I left, and
    now used by clients and RMs both.
    <a
      class="text-blue-400 underline underline-offset-4"
      href="https://psiderman.notion.site/Dezerv-Web-39b7c0b161b3803c9b90d1e193692155"
      target="_blank"
      >Read more here.</a
    >
  </p>
  <img v-lazy="imageData.dWeb" class="anime-entry gallery-image" />
</template>

<script setup>
import anime from "animejs";
import { onMounted } from "vue";

const imageData = {
  dWeb: new URL("@/assets/design/dezerv02.png", import.meta.url).toString(),
  prosper: new URL("@/assets/design/dezerv01.png", import.meta.url).toString(),
};

onMounted(() => {
  anime({
    delay: anime.stagger(100),
    duration: 500,
    easing: "easeOutBack",
    opacity: [0, 1],
    scale: [0.95, 1],
    targets: [".anime-entry, h1, h2, h3, p, ul, li, span"],
    transformOrigin: "center",
    translateY: ["1rem", "0"],
  });
});
</script>

<style  scoped>
@reference "tailwindcss";
.motion-card {
  @apply pointer-events-none aspect-square overflow-hidden rounded-3xl border border-white/15 bg-black;
}

.motion-card video {
  @apply h-full w-full object-contain;
}

img.gallery-image {
  @apply mx-auto aspect-video w-full max-w-screen-sm shrink-0 rounded-sm border border-white/15 bg-black select-none;
}
</style>
