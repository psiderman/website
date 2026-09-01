<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="desktop:px-20 flex flex-col px-4 pt-20">
      <div class="flex min-h-[calc(100svh-5rem)] flex-col gap-10">
        <div class="text-p mx-auto w-full max-w-prose text-left">
          <h1 v-reveal class="text-display w-fit">gaming</h1>
        </div>

        <div class="text-p text-text-primary flex flex-col gap-12">
          <!-- Stack -->
          <section class="mx-auto flex w-full max-w-prose grow flex-col gap-6">
            <p class="text-text-secondary italic">Last updated: 2 jan, 2024</p>
            <h2 class="text-h2">stack: pc + console</h2>
            <p>
              i built my PC back in 2014, and it's due for an upgrade any minute now. it's kept me
              company from the likes of batman: arkham asylum and splinter cell: blacklist, and
              although sluggishly, even up to hitman 3 and watch dogs 2. for games after 2022, i
              have my PS5.
            </p>
          </section>

          <!-- PC setup -->
          <section class="mx-auto flex w-full max-w-prose grow flex-col gap-4">
            <h2 class="text-h2">the rig</h2>
            <div class="grid grid-cols-6 gap-3">
              <img
                v-lazy="pcSetup.pc.url"
                v-tooltip="pcSetup.pc.title"
                :alt="pcSetup.pc.alt"
                class="bg-surface-secondary col-span-6 aspect-square w-full rounded-xl object-cover lg:col-span-5"
              />
              <div class="bg-dark my-auto flex h-5/6 flex-col justify-between rounded-xl p-3">
                <img
                  v-for="part in pcSetup.parts"
                  :key="part.name"
                  v-lazy="part.url"
                  v-tooltip="{ content: part.title, group: 'pcparts', placement: 'right' }"
                  :alt="part.alt"
                  class="aspect-square w-full rounded-lg object-scale-down"
                />
              </div>
            </div>
            <p class="text-ui-small text-text-tertiary mx-auto">
              my best estimate of total hours played in life: 13,000h+
            </p>
          </section>

          <!-- Valorant montage -->
          <section class="mx-auto flex w-full max-w-prose grow flex-col gap-4">
            <h2 class="text-h2">valorant gameplay montage</h2>
            <p class="text-text-secondary">
              i always wanted to create some sort of a gameplay montage, and had been recording
              these for a while. had some time today so i fired up iMovie and picked a song from my
              recents in spotify.
            </p>
          </section>
          <div
            class="w-50svh max-w-container mx-auto flex w-full grow flex-col items-center justify-center gap-4 overflow-hidden rounded-lg"
          >
            <iframe
              src="https://fast.wistia.net/embed/iframe/ybn9loazpr?seo=false&videoFoam=true"
              title="Valorant Reel"
              allow="autoplay; fullscreen"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              class="bg-dark block aspect-video h-full w-full border-0"
            ></iframe>
            <p class="text-p text-text-tertiary">
              video editing is difficult but it's easier than ranking higher in valorant :')
            </p>
          </div>

          <!-- All-time favorites -->
          <section class="text-p mx-auto flex max-w-prose flex-col gap-6">
            <h2 class="text-h2">all-time favorites</h2>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <button
                v-for="(game, idx) in gameImages"
                :key="game.name"
                v-reveal="idx * 70 + 70"
                type="button"
                :aria-label="`open ${game.caption}`"
                class="group relative aspect-square overflow-hidden rounded-xl transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none"
                @click="triggerLightbox(idx)"
              >
                <img
                  v-lazy="game.url"
                  :alt="game.caption"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import ContactForm from '@/components/home/ContactForm.vue'
import { isPhotoLightBoxOpen, photoLightBoxData } from '@/composables/useGlobal'

const GAME_CAPTIONS: Record<string, string> = {
  arkham:
    "i can't remember if this or splinter cell: conviction was my introduction to stealth. probably this one since i was such a batman nerd.",
  budokai: 'this defined summer vacations for my brother and i.',
  hitman3:
    "i was never a fan of the earlier hitman games, but this trilogy has to be one of the best stealth series i've played.",
  lis: 'i always recommend life is strange to someone who wants to start out with games.',
  spiderman:
    '100% plat on the ps4, ps5, and spiderman 2 as well. i really wish sm2 lived up to the hype. would have replaced this tile here.',
  valo: "it's the one game that i'm not great at, but i love playing. there's always the one.",
}

const gameImages = Object.entries(
  import.meta.glob<string>('@/assets/gaming/*.{webp,jpg,jpeg,png}', {
    eager: true,
    import: 'default',
  }),
)
  .map(([path, url]) => {
    const name = (path.split('/').pop() ?? path).replace(/\.(webp|jpg|jpeg|png)$/i, '')
    return { caption: GAME_CAPTIONS[name] || name, name, url }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const PC_SPECS: Record<string, { alt: string; title: string }> = {
  corsair: {
    alt: 'Corsair Graphite Series 230T ATX Mid Tower',
    title: 'Corsair Graphite Series 230T ATX Mid Tower',
  },
  gigabyte: {
    alt: 'Gigabyte GA-B85M-D3H Micro-ATX LGA1150',
    title: 'Gigabyte GA-B85M-D3H Micro-ATX LGA1150',
  },
  intel: {
    alt: 'Intel Core i5-4670 @3.4GHz Quad-Core',
    title: 'Intel Core i5-4670 @3.4GHz Quad-Core',
  },
  nvidia: {
    alt: 'Zotac GeForce GTX 1060 3GB',
    title: 'Zotac GeForce GTX 1060 3GB',
  },
}

const pcImages = Object.entries(
  import.meta.glob<string>('@/assets/gaming/pc/*.{jpeg,jpg,png,webp}', {
    eager: true,
    import: 'default',
  }),
).map(([path, url]) => ({
  name: (path.split('/').pop() ?? path).replace(/\.(jpeg|jpg|png|webp)$/i, ''),
  url,
}))

const pcSetup = {
  parts: pcImages
    .filter((i) => i.name !== 'pc')
    .map((i) => ({
      ...i,
      alt: PC_SPECS[i.name]?.alt ?? i.name,
      title: PC_SPECS[i.name]?.title ?? i.name,
    })),
  pc: {
    alt: 'pc setup',
    title: "this picture was taken before i got my playstation, but it's here in spirit.",
    url: pcImages.find((i) => i.name === 'pc')?.url ?? '',
  },
}

const triggerLightbox = (clickedIdx: number) => {
  if (gameImages.length === 0) return

  const allImages = gameImages.map((img) => ({
    caption: img.caption,
    thumbnailUrl: img.url,
    url: img.url,
  }))

  const orderedImages = [...allImages.slice(clickedIdx), ...allImages.slice(0, clickedIdx)]

  photoLightBoxData.value = {
    currentTripSlug: '',
    images: orderedImages,
    initialIndex: 0,
    tripTitle: 'gaming',
  }
  isPhotoLightBoxOpen.value = true
}
</script>

<style scoped>
@reference "@/style.css";
</style>
