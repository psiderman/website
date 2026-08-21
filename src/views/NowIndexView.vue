<template>
  <div class="now-index">
    <h1>Now</h1>

    <div v-if="isLoading">Loading posts...</div>
    <div v-else-if="error">Error loading posts.</div>
    <ul v-else-if="posts && posts.length > 0">
      <li v-for="post in posts" :key="post.date">
        <router-link :to="`/now/${post.date.substring(0, 7)}`">
          {{ post.date.substring(0, 7) }}
        </router-link>
      </li>
    </ul>
    <div v-else>No posts found.</div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

import { supabase } from '@/supabase'

const {
  data: posts,
  error,
  isLoading,
} = useQuery({
  queryFn: async () => {
    const { data, error } = await supabase
      .from('now')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  },
  queryKey: ['now-posts'],
})
</script>

<style scoped>
.now-index {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 1rem;
}
</style>
