<template>
  <div class="flex w-full flex-col gap-0">
    <div class="flex h-[calc(100svh-80px)] flex-col">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="max-w-container mx-auto flex h-full w-full items-center justify-center"
      >
        <GenericLoader />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="max-w-container bg-surface-secondary mx-auto flex h-full w-full items-center justify-center"
      >
        <p class="text-mono text-text-tertiary">Error loading travels.</p>
      </div>

      <!-- Main Layout -->
      <div
        v-else
        class="desktop:grid desktop:px-0 desktop:grid-cols-[1fr_min(40%,400px)_min(60%,1020px)_1fr] noscrollbar h-full w-full grid-cols-2 gap-8 px-4"
      >
        <div></div>
        <div
          class="desktop:grid-cols-1 grid h-full grid-cols-2 flex-col gap-10 overflow-scroll pb-10"
        >
          <div
            v-for="travel in travelsWithImages"
            :key="travel.slug"
            class="border-border-primary bg-surface-primary pointer-events-auto flex h-fit flex-col gap-2 rounded-xl border p-0 transition-colors duration-200"
          >
            <div
              v-if="travel.images && travel.images.length > 0"
              class="bg-surface-secondary noscrollbar flex h-20 flex-row overflow-x-auto rounded-t-xl"
            >
              <template v-for="img in travel.images" :key="img.id">
                <img
                  :src="img.url"
                  :alt="img.name"
                  class="size-20 shrink-0 rounded-md object-cover"
                />
              </template>
            </div>
            <pre>
              {{ travelsWithImages?.[0]?.images?.[9] }}
            </pre>
            <div class="flex flex-col gap-3 p-6">
              <div class="flex w-full flex-row items-start justify-between">
                <div class="flex flex-col gap-1">
                  <h2 class="text-h2 text-text-primary">{{ travel.title }}</h2>
                  <p class="text-ui text-text-secondary">{{ travel.dateLabel }}</p>
                </div>
                <div class="-mt-1 flex flex-row">
                  <div
                    class="hover:from-hover hover:to-hover active:from-press active:to-press flex size-8 items-center justify-center rounded-full bg-linear-0"
                    :class="travel.repeatVisit ? 'text-text-primary' : 'text-text-tertiary'"
                  >
                    <component :is="travel.repeatVisit ? Repeat : RepeatOff" :size="16" />
                  </div>
                  <div
                    class="hover:from-hover hover:to-hover active:from-press active:to-press flex size-8 items-center justify-center rounded-full bg-linear-0"
                    :class="travel.instagramLink ? 'text-text-primary' : 'text-text-tertiary'"
                    :size="16"
                  >
                    <FA :icon="['fab', 'instagram']" class="text-ui" />
                  </div>
                  <div
                    class="hover:from-hover hover:to-hover active:from-press active:to-press flex size-8 items-center justify-center rounded-full bg-linear-0"
                    :class="travel.mapsListLink ? 'text-text-primary' : 'text-text-tertiary'"
                  >
                    <component :is="travel.mapsListLink ? Pin : PinOff" :size="16" />
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <p v-for="(p, p_id) in travel.description" :key="p_id" class="text-p">
                  {{ p }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="desktop:flex col-span-2 hidden h-full bg-blue-200"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pin, PinOff, Repeat, RepeatOff } from '@lucide/vue'

import GenericLoader from '@/components/GenericLoader.vue'
import { useTravelsWithImages } from '@/composables/useTravel'

const { error, isLoading, travelsWithImages } = useTravelsWithImages()
</script>

<style scoped>
@reference "@/style.css";
</style>
