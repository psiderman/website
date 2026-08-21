<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <div class="flex flex-col px-20">
      <router-view />
    </div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import ContactForm from '@/components/home/ContactForm.vue'
</script>
