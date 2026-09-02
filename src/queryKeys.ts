import type { Ref } from 'vue'

/**
 * Single source of truth for tanstack query keys. First element of each array
 * doubles as the cache/persistence prefix (see queryClient.ts), so keep the
 * leading strings byte-identical to what they were.
 */
export const queryKeys = {
  admin: {
    blog: ['admin-blog'],
    guestbook: ['admin-guestbook'],
    images: ['admin-images'],
    quotes: ['admin-quotes'],
    trips: ['admin-trips'],
    userPageViews: ['admin-user-page-views'],
    userRoles: ['admin-user-roles'],
    workPeople: ['admin-work-people'],
  },
  blog: {
    content: (slug: Ref<string> | string) => ['blog-post-content', slug],
    contentBase: ['blog-post-content'],
    list: ['blog-posts'],
    // `slug` stays reactive so the key tracks navigation between posts.
    post: (slug: Ref<string> | string) => ['blog-post', slug],
    postBase: ['blog-post'],
  },
  guestbook: {
    latest: ['guestbook', 'latest'],
    list: ['guestbook'],
  },
  movies: ['movies'],
  now: ['now-entries-content'],
  nowPlaying: ['now-playing'],
  quotes: ['quotes'],
  recentlyPlayed: ['recently-played'],
  thwips: ['thwips'],
  travel: {
    tripImages: ['trip-images'],
    trips: ['trips'],
    tripsWithImages: ['trips-with-images'],
  },
  workPeople: {
    // `orgId` stays reactive so the key tracks which org's panel is open.
    byOrg: (orgId: Ref<string | undefined> | string) => ['work-people', orgId],
    list: ['work-people'],
  },
} as const
