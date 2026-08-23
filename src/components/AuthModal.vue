<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-overlay fixed inset-0 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="bg-surface-primary border-border-primary flex h-90 w-80 flex-col items-center justify-center gap-8 rounded-xl border px-6 py-12 shadow-none!"
            >
              <div class="flex flex-col gap-2 text-center">
                <p class="text-display mb-2">🚪</p>
                <DialogTitle as="h2" class="text-h2 text-text-primary">
                  come on in, <br />
                  don't be a stranger</DialogTitle
                >
                <p class="text-ui text-text-secondary">
                  some features on this website are <br />
                  only available after you log in
                </p>
              </div>

              <div class="flex w-fit flex-col items-center gap-2">
                <button class="btn primary" @click="signInWithGoogle">
                  <FA :icon="['fab', 'google']" class="text-ui-small" />
                  Continue with Google
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { supabase } from '@/supabase'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: window.location.origin,
    },
    provider: 'google',
  })

  if (error) {
    console.error('Error logging in:', error.message)
  }
}
</script>

<style scoped>
@reference "@/style.css";
</style>
