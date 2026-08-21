<template>
  <header class="flex w-screen flex-row items-center justify-center">
    <div class="max-w-container flex w-full flex-row items-center justify-between px-10 py-5">
      <div class="flex flex-row items-center justify-center gap-2">
        <div class="bg-coal relative size-8 overflow-hidden rounded-full">
          <img
            src="@/assets/svg/psider.svg"
            class="absolute top-2 left-1 -my-px -ml-px scale-200"
          />
        </div>

        <p class="text-text-tertiary text-ui-small text-left">
          i'm in {{ current_location.city }} <br />
          and it is {{ currentTime }} right now
        </p>
      </div>
      <div class="flex flex-row gap-4">
        <button
          class="theme-toggle bg-surface-primary border-border-primary flex h-10 flex-row rounded-full border p-0.75"
        >
          <div>
            <Moon :size="16" />
          </div>
          <div>
            <Sun :size="16" />
          </div>
          <div>
            <Monitor :size="16" />
          </div>
        </button>
        <button
          class="bg-surface-inverted text-text-inverted-primary text-ui rounded-full px-6 py-2"
        >
          Log in
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { onMounted, onUnmounted, ref } from 'vue'

import { supabase } from '../supabase'

interface Location {
  city: string
  timezone: string
}

const current_location = ref<Location>({
  city: 'bengaluru, india',
  timezone: 'Asia/Kolkata',
})

const currentTime = ref('11:11')
let timer: ReturnType<typeof setInterval>

const updateTime = () => {
  if (!current_location.value.timezone) return

  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone: current_location.value.timezone,
  })
  currentTime.value = formatter.format(new Date())
}

async function getCurrentLocation() {
  try {
    const { data } = await supabase.from('variables').select().eq('id', 'current_location')
    if (data && data[0]) {
      current_location.value.city = data[0].value.city || ''
      current_location.value.timezone = data[0].value.time || data[0].value.timezone || ''
      updateTime()
    }
  } catch (err) {
    console.error('Error fetching location:', err)
  }
}

onMounted(() => {
  getCurrentLocation()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
@reference "@/style.css";

button.theme-toggle > div {
  @apply flex size-8 items-center justify-center p-2;
}
</style>
