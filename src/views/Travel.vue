<script setup>
import { countriesData } from "@/store/travelData.js";
import { reactive } from "vue";
const countries = reactive(countriesData);
</script>
<template>
  <h1 class="mb-4">You don't need more than /r/onebag</h1>
  <p>
    This isn't my most recent setup, but it's the most recent picture. I started
    my 62 day SEA trip with this setup. The overall weight is 9kgs, of which the
    laptop is 1.5kgs. Of course, I made a
    <a
      href="https://docs.google.com/spreadsheets/d/1qaqdf6zLSnEwbf700jZxeuDoB4JNATjNvUZObxbKWxE/edit?usp=sharing"
      class="hover:underline"
      target="_blank"
      >spreadsheet</a
    >. When I pack and dress smartly, I can bring the weight to under 7kgs.
  </p>
  <p>
    Besides the obvious benefits of not lugging around luggage, I also love that
    I've finally trimmed down to all plain black tees (not pictured).
  </p>

  <div>
    <img
      class="anime-entry aspect-square h-full w-full overflow-hidden rounded-lg bg-black object-contain outline outline-white/10"
      src="@/assets/travel/bag-i.jpeg"
      title=""
    />
  </div>
  <p class="caption">
    You can learn more about one bagging
    <a
      href="https://www.reddit.com/r/onebag/wiki/index/#wiki_what_is_onebag.3F"
      target="_blank"
      class="underline"
      >here</a
    >
  </p>
  <h1 title="log, get it?" class="cursor-help">Travel 🪵</h1>
  <template v-for="country in countries" :key="country.name">
    <template v-for="location in country.locations" :key="location.name">
      <h2>
        {{ country.flag }}
        <span v-if="location.name">{{ location.name }}, </span
        >{{ country.name }}
      </h2>
      <p v-if="location.description">{{ location.description }}</p>
      <div class="large grid select-none grid-cols-4 gap-4">
        <div
          class="anime-entry aspect-long overflow-hidden rounded-lg bg-black outline outline-white/10"
          v-for="image in location.images"
          :key="image.id"
        >
          <img
            :class="[
              'h-full w-full select-none',
              image.contain ? 'object-contain' : 'object-cover',
              image.caption ? 'cursor-help' : '',
            ]"
            v-lazy="image.url"
            :alt="image.caption"
            :title="image.caption"
          />
        </div>
      </div>
      <p>
        There's more on my instagram, I'll move them here one of these weekends.
      </p>
    </template>
  </template>
</template>
