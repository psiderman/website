<template>
  <div class="flex w-full flex-row items-center justify-center gap-8 p-20">
    <img
      src="@/assets/images/public.jpg"
      alt="karan sanas"
      class="border-border-primary aspect-auto h-60 rounded-[5rem] border"
    />
    <div class="flex w-120 flex-col items-start justify-center gap-4">
      <div class="text-ui text-text-secondary flex flex-col gap-0">
        <p>@psiderman</p>
        <h1 class="text-display text-text-primary">hi, i'm karan</h1>
        <p class="-mt-1">
          i’m still searching for a one-liner to sum me up.<br />until then my life is a bento box
          of endless interests,<br />neatly packed for display on my ever-evolving personal website.
        </p>
      </div>
      <div class="flex w-full flex-row justify-start gap-4">
        <button
          v-for="emj in emojis"
          :key="emj.id"
          class="emoji-filter"
          :class="{
            default: !activeFilter,
            active: activeFilter === emj.id,
            inactive: activeFilter && activeFilter !== emj.id,
          }"
          @click="activeFilter = activeFilter === emj.id ? null : emj.id"
        >
          <span>
            {{ emj.emoji }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EMOJI_GROUPS, type EmojiGroupId } from '@/types'

const activeFilter = defineModel<EmojiGroupId | null>('filter')

const emojis = EMOJI_GROUPS
</script>

<style scoped>
@reference "@/style.css";

.emoji-filter {
  @apply text-ui flex size-14 cursor-pointer items-center justify-center rounded-full bg-linear-0 transition-all;

  &.default {
    @apply bg-surface-tertiary hover:from-hover hover:to-hover active:from-press active:to-press;
  }

  &.active {
    @apply bg-surface-inverted hover:from-hover-inverted hover:to-hover-inverted active:from-press-inverted active:to-press-inverted;
  }

  &.inactive {
    @apply bg-surface-secondary hover:from-hover hover:to-hover active:from-press active:to-press;

    span {
      @apply opacity-50 mix-blend-luminosity;
    }

    &:hover span {
      @apply opacity-75;
    }

    &:active span {
      @apply opacity-100 mix-blend-normal;
    }
  }
}
</style>
