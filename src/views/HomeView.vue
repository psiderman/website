<template>
  <div class="max-w-container flex w-full flex-col gap-0">
    <AboutMe />

    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import AboutMe from '@/components/home/AboutMe.vue'
import ContactForm from '@/components/home/ContactForm.vue'
</script>

<style>
@reference "@/style.css";
</style>
