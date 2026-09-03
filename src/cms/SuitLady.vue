<template>
  <div class="flex h-screen w-full items-center justify-center bg-zinc-950">
    <div class="bg-background mx-auto flex h-dvh w-full max-w-120 flex-col overflow-hidden">
      <TabGroup
        :selected-index="selectedTab"
        as="div"
        class="flex size-full flex-col overflow-hidden"
        @change="(index: number) => (selectedTab = index)"
      >
        <div
          class="bg-surface-inverted text-text-inverted-primary text-ui relative flex items-center justify-between border-b border-transparent p-2"
        >
          <span>suitlady v1.2</span>
          <ThemeToggle class="absolute right-2" />
        </div>
        <TabList
          class="border-border-primary noscrollbar flex w-full flex-row gap-1 overflow-scroll border-b"
        >
          <Tab v-for="tab in tabs" :key="tab.name" v-slot="{ selected }" as="template">
            <button
              class="text-ui flex cursor-pointer flex-row items-center justify-center gap-2 border-b-2 p-2 transition-colors outline-none"
              :class="
                selected
                  ? 'border-surface-inverted text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary border-transparent'
              "
            >
              <component :is="tab.icon" :size="16" />
              <span>{{ tab.name }}</span>
            </button>
          </Tab>
        </TabList>

        <TabPanels
          ref="scrollContainer"
          class="relative size-full overflow-auto"
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <!-- Pull to Refresh Indicator -->
          <div
            class="pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center justify-center transition-all duration-150 ease-out"
            :style="{
              height: `${pullDistance}px`,
              opacity: pullDistance > 0 ? Math.min(pullDistance / pullThreshold, 1) : 0,
              transform: `translateY(${Math.min(pullDistance, pullThreshold * 1.5)}px)`,
            }"
          >
            <div
              class="bg-surface-primary border-border-primary flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
            >
              <Loader
                :size="16"
                :class="['text-text-primary', isRefreshing ? 'animate-spin' : '']"
                :style="{
                  transform: !isRefreshing ? `rotate(${pullDistance * 3}deg)` : undefined,
                }"
              />
              <span class="text-ui-small text-text-secondary">
                {{
                  isRefreshing
                    ? 'Refreshing...'
                    : pullDistance > pullThreshold
                      ? 'Release to refresh'
                      : 'Pull to refresh'
                }}
              </span>
            </div>
          </div>

          <!-- Roles Tab Panel -->
          <TabPanel class="outline-none">
            <RolesPanel />
          </TabPanel>

          <!-- People Tab Panel -->
          <TabPanel class="outline-none">
            <PeoplePanel />
          </TabPanel>

          <!-- Trip Tab Panel -->
          <TabPanel class="outline-none">
            <TripsPanel />
          </TabPanel>

          <!-- Images Tab Panel -->
          <TabPanel class="h-full overflow-hidden outline-none">
            <ImagesPanel />
          </TabPanel>

          <!-- Guestbook Tab Panel -->
          <TabPanel class="outline-none">
            <GuestbookPanel />
          </TabPanel>

          <!-- Blog Tab Panel -->
          <TabPanel class="outline-none">
            <BlogPanel />
          </TabPanel>

          <!-- Quotes Tab Panel -->
          <TabPanel class="outline-none">
            <QuotesPanel />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import {
  BriefcaseBusiness,
  Feather,
  GalleryHorizontal,
  KeyRound,
  Loader,
  Luggage,
  Notebook,
  Pencil,
} from '@lucide/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { ref } from 'vue'

import ThemeToggle from '@/components/ThemeToggle.vue'
import { queryKeys } from '@/queryKeys'

import BlogPanel from './components/BlogPanel.vue'
import GuestbookPanel from './components/GuestbookPanel.vue'
import ImagesPanel from './components/ImagesPanel.vue'
import PeoplePanel from './components/PeoplePanel.vue'
import QuotesPanel from './components/QuotesPanel.vue'
import RolesPanel from './components/RolesPanel.vue'
import TripsPanel from './components/TripsPanel.vue'

const selectedTab = ref(0)
const tabs = [
  { icon: KeyRound, name: 'roles' },
  { icon: BriefcaseBusiness, name: 'people' },
  { icon: Luggage, name: 'trip' },
  { icon: GalleryHorizontal, name: 'images' },
  { icon: Pencil, name: 'guestbook' },
  { icon: Notebook, name: 'blog' },
  { icon: Feather, name: 'quotes' },
]

const tabQueryKeys: Record<number, readonly string[]> = {
  0: queryKeys.admin.userRoles,
  1: queryKeys.admin.workPeople,
  2: queryKeys.admin.trips,
  3: queryKeys.admin.images,
  4: queryKeys.admin.guestbook,
  5: queryKeys.admin.blog,
  6: queryKeys.admin.quotes,
}

const queryClient = useQueryClient()

// Pull to refresh state & handlers
const pullDistance = ref(0)
const pullThreshold = 60
const isRefreshing = ref(false)

let startY = 0
let isPulling = false

async function handleRefresh() {
  const queryKey = tabQueryKeys[selectedTab.value]
  if (queryKey) {
    await queryClient.invalidateQueries({ queryKey })
  }
  await queryClient.invalidateQueries({ queryKey: queryKeys.admin.userPageViews })
}

async function onTouchEnd() {
  if (!isPulling || isRefreshing.value) return
  isPulling = false

  if (pullDistance.value >= pullThreshold) {
    isRefreshing.value = true
    pullDistance.value = pullThreshold
    await handleRefresh()
    isRefreshing.value = false
  }
  pullDistance.value = 0
}

function onTouchMove(e: TouchEvent) {
  if (!isPulling || isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  const currentY = e.touches[0].clientY
  const diffY = currentY - startY

  if (diffY > 0 && (!target || target.scrollTop <= 0)) {
    pullDistance.value = Math.min(diffY * 0.45, 120)
  } else {
    pullDistance.value = 0
    isPulling = false
  }
}

function onTouchStart(e: TouchEvent) {
  if (isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  if (!target || target.scrollTop <= 0) {
    startY = e.touches[0].clientY
    isPulling = true
  }
}
</script>
