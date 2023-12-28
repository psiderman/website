<script setup>
const data = [
  {
    id: 1,
    caption: "I need a balcony like this in Bangalore.",
    url: new URL("../assets/now/01.jpeg", import.meta.url).toString(),
  },
  {
    id: 2,
    caption: "Poker with Monopoly money.",
    url: new URL("../assets/now/02.jpeg", import.meta.url).toString(),
  },
  {
    id: 3,
    caption: "I can't ever seem to get the recipe right for sabudana khichdi.",
    url: new URL("../assets/now/03.jpeg", import.meta.url).toString(),
  },
  {
    id: 4,
    caption: "My bicycle cards have seen a lot of action.",
    url: new URL("../assets/now/04.jpeg", import.meta.url).toString(),
  },
];
</script>
<template>
  <div class="grid grid-cols-4 gap-4">
    <div
      class="aspect-long overflow-hidden rounded-lg bg-black outline outline-white/10"
      v-for="image in data"
      :key="image.id"
    >
      <img
        class="h-full w-full object-cover"
        :src="image.url"
        :alt="image.caption"
        :title="image.caption"
      />
    </div>
  </div>
  <h1 class="mb-4">What am I doing now?</h1>
  <div class="text-xs text-white/50">
    This is a
    <a href="https://nownownow.com/about" target="_blank" class="underline"
      >/now page</a
    >
    inspired by Derek Sivers.
  </div>

  <h3>December 31, 2023</h3>
  <ul>
    <li>
      Moved back to Kolhapur and brought my PS5 with me. Thought I'd only spend
      a couple of weeks here, but it's been close to five. I made the mistake of
      teaching my parents poker using monopoly money and they're addicted to the
      game. We bought chips. They aren't gamblers so hopefully, they'll never
      play with real money.
    </li>
    <li>
      The last few months have been a good break and a great change of scenery
      after working for five years non-stop. But a big part of my life has been
      my work, which is missing right now. I'm not quite ready to give that up
      just yet. I now find myself redoing my portfolio and applying for jobs
      again, with some excitement and loads of nervousness.
    </li>
    <li>
      I also can't bring myself to focus on building a product from scratch at
      this point in life; not alone. So, I'm pressing pause on Kiwi as well.
    </li>
    <li>
      I resumed therapy again. Who knew quitting your job and giving your
      apartment would mean having to work through some uncomfortable thoughts?
      Not me!
    </li>
  </ul>
</template>

<style lang="postcss" scoped></style>
