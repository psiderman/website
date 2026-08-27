<template>
  <!-- Disabled on mobile because Work Modal is not responsive -->
  <div
    class="border-border-primary desktop:pointer-events-auto bg-surface-secondary dark:bg-dark noscrollbar pointer-events-none relative flex h-full w-full overflow-scroll rounded-lg border focus:outline-none"
    tabindex="-1"
  >
    <template v-if="careerData.length > 0">
      <!-- Gridlines -->
      <div class="absolute z-0 flex w-full flex-col gap-1.5 px-10 py-12">
        <!-- Top Gridlines -->
        <div class="absolute inset-x-10 -mt-10.5 flex h-fit flex-col gap-1.5">
          <div v-for="tick in timelineData.topPaddingTicks" :key="tick.id" class="relative w-full">
            <div class="tick" :class="tick.widthClass"></div>
            <div
              v-if="tick.isJan"
              class="text-mono text-text-tertiary bg-surface-secondary dark:bg-dark absolute bottom-0.75 h-4 w-8 text-left"
            >
              {{ tick.year }}
            </div>
          </div>
        </div>

        <!-- Main Gridlines -->
        <div v-for="tick in timelineData.mainTicks" :key="tick.id" class="relative w-full">
          <div class="tick" :class="tick.widthClass"></div>
          <div
            v-if="tick.isJan"
            class="text-mono text-text-tertiary bg-surface-secondary dark:bg-dark absolute bottom-0.75 h-4 w-8 text-left"
          >
            {{ tick.year }}
          </div>
        </div>

        <!-- Bottom Gridlines -->
        <!-- change bottom-1.5 if you change py-12 above. -->
        <div class="absolute inset-x-10 bottom-1.5 flex h-fit flex-col gap-1.5">
          <div
            v-for="tick in timelineData.bottomPaddingTicks"
            :key="tick.id"
            class="relative w-full"
          >
            <div class="tick" :class="tick.widthClass"></div>
          </div>
        </div>
      </div>

      <!-- Blocks -->
      <div class="absolute z-10 -mt-px flex w-full flex-col px-10 py-10.5 pl-20">
        <div v-for="block in timelineData.blocks" :key="`${block.org}-${block.startDate}`">
          <div
            class="grid w-full grid-cols-2 pt-0.75 pb-0.5"
            :style="{ height: `${block.heightPx}px` }"
          >
            <component
              :is="block.clickable ? 'button' : 'div'"
              class="work-block text-ui-small"
              :class="{ 'col-start-2': block.track == 'right', clickable: block.clickable }"
              @click="openWorkModal(block.org_id)"
            >
              <div class="flex size-4 shrink-0 items-center justify-center">
                <img
                  v-if="block.logoUrl"
                  :src="block.logoUrl"
                  :alt="`${block.org} Logo`"
                  class="size-3 rounded-sm"
                  width="128"
                  height="128"
                />
                <span v-else-if="block.emoji">{{ block.emoji }}</span>
              </div>
              <div class="flex grow flex-col">
                <p class="text-text-primary">{{ block.org }}</p>
                <p v-if="block.role" class="text-text-secondary">{{ block.role }}</p>
                <p class="text-text-tertiary mt-1">
                  {{ block.durationText }}<span v-if="!block.endDate">...</span>
                </p>
              </div>
            </component>
          </div>
        </div>
      </div>

      <!-- Today Indicator -->
      <div class="pointer-events-none absolute inset-0 z-20">
        <div class="absolute top-10 right-6 left-9 h-0.75 bg-red-500 dark:bg-red-600">
          <div
            class="absolute left-0 -mt-0.75 -ml-1 size-2.25 rounded-full bg-red-500 dark:bg-red-600"
          ></div>
          <div
            class="text-ui-small text-surface-secondary dark:text-dark absolute right-0 -mt-1.75 -mr-4 h-4.25 w-8 rounded-full bg-red-500 text-center dark:bg-red-600"
          >
            now
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2">
      <OctagonAlert :size="24" class="text-text-tertiary" />
      <div class="text-text-tertiary text-ui">Error fetching data</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OctagonAlert } from '@lucide/vue'
import { differenceInCalendarMonths, getYear, min } from 'date-fns'
import { computed } from 'vue'

import { isWorkModalOpen, workData } from '@/composables/useGlobal'
import { workHistory } from '@/data/work'

const openWorkModal = (orgId: string) => {
  const data = workHistory.find((w) => w.orgId === orgId)
  if (data?.data)
    if (data) {
      workData.value = data
      isWorkModalOpen.value = true
    }
}

const careerData = computed(() => {
  return workHistory.map((item) => ({
    clickable: item.clickable ?? false,
    data: item.data ?? null,
    emoji: item.emoji ?? undefined,
    endDate: item.endDate ? new Date(item.endDate) : undefined,
    org: item.orgName,
    org_id: item.orgId,
    role: item.role,
    startDate: new Date(item.startDate),
    track: item.isLeft ? 'left' : 'right',
  }))
})

const formatDuration = (start: Date, end: Date) => {
  const totalMonths = differenceInCalendarMonths(end, start) + 1
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  const parts = []
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`)
  if (months) parts.push(`${months} mo${months > 1 ? 's' : 'n'}`)

  return parts.length > 0 ? parts.join(' ') : '1 mo'
}

const MONTH_HEIGHT = 7

const getTicks = (topDate: Date, count: number) => {
  const ticks = []
  let current = topDate
  for (let i = 0; i < count; i++) {
    const y = current.getFullYear()
    const m = current.getMonth() + 1
    const isJan = m === 1
    const isQuarter = (m - 1) % 3 === 0

    ticks.push({
      id: `${y}-${m}`,
      isJan,
      widthClass: isJan ? 'w-full' : isQuarter ? 'w-4' : 'w-2',
      year: y,
    })

    current = new Date(y, m - 2, 1) // subtract 1 month
  }
  return ticks
}

const timelineData = computed(() => {
  if (careerData.value.length === 0) {
    return { blocks: [], bottomPaddingTicks: [], mainTicks: [], topPaddingTicks: [] }
  }

  const sorted = [...careerData.value].sort((a, b) => {
    return b.startDate.getTime() - a.startDate.getTime()
  })

  const now = new Date()

  const dates = sorted.flatMap((b) => [b.startDate, b.endDate || now])
  const minYear = getYear(min(dates))

  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth()

  // The absolute timeline top is exactly this month.
  const timelineTopDate = new Date(todayYear, todayMonth, 1)

  // Top Padding (6 months into the future)
  const topPaddingTopDate = new Date(todayYear, todayMonth + 6, 1)
  const topPaddingTicks = getTicks(topPaddingTopDate, 6)

  // Main Ticks (from today down to minYear's January)
  const mainCount = differenceInCalendarMonths(timelineTopDate, new Date(minYear, 0, 1)) + 1
  const mainTicks = getTicks(timelineTopDate, mainCount)

  // Bottom Padding (6 months prior to minYear)
  const bottomPaddingTopDate = new Date(minYear - 1, 11, 1) // Dec 1st
  const bottomPaddingTicks = getTicks(bottomPaddingTopDate, 6)

  const blocks = sorted.map((block) => {
    const start = block.startDate
    const end = block.endDate || now

    const heightMonths = differenceInCalendarMonths(end, start) + 1
    const heightPx = heightMonths * MONTH_HEIGHT

    const logoUrl = block.org_id
      ? new URL(`../../assets/logos/${block.org_id}.webp`, import.meta.url).href
      : undefined

    return {
      ...block,
      durationText: formatDuration(start, end),
      heightPx,
      logoUrl,
    }
  })

  return {
    blocks,
    bottomPaddingTicks,
    mainTicks,
    topPaddingTicks,
  }
})
</script>

<style scoped>
@reference "@/style.css";

.work-block {
  @apply bg-surface-primary border-border-primary rounded-special desktop:flex-row relative flex flex-col gap-1 overflow-hidden border bg-linear-0 p-3;

  &.clickable {
    @apply cursor-pointer;
    @apply hover:from-hover hover:to-hover;
  }

  &::after {
    content: '';
    @apply to-surface-primary pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 w-full bg-linear-180 from-transparent;
  }
}

.tick {
  @apply bg-border-primary h-px rounded-sm;
}
</style>
