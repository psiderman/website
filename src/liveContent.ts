import { queryKeys } from '@/queryKeys'

/**
 * Single source of truth for "content lives in Supabase and can change at any
 * time". Everything here is driven three ways off this one table:
 *
 *   1. A realtime `postgres_changes` subscription per table → invalidate the
 *      listed query keys the moment a row changes (useRealtimeSync).
 *   2. `refetchOnRestore: 'always'` for the listed public keys — a reloaded
 *      tab must re-fetch instead of trusting a (possibly old) localStorage
 *      snapshot. Realtime events don't replay across reloads.
 *   3. A long `staleTime` (see the LIVE_STALE_MS default) so the client stays
 *      "fresh" and quiet in-memory between events — no time-based refetches;
 *      realtime invalidation is the only thing that forces a refresh.
 *
 * Add a new table your site edits → one line here → realtime + reload
 * correctness + long-cache apply automatically. Admin (`admin-*`) keys ride
 * along for the realtime invalidation but keep their own no-persist / stale-0
 * defaults.
 */
export const LIVE_TABLES: ReadonlyArray<{ keys: readonly string[]; table: string }> = [
  {
    keys: [...queryKeys.travel.trips, ...queryKeys.travel.tripsWithImages, ...queryKeys.admin.trips],
    table: 'trips',
  },
  {
    keys: [
      ...queryKeys.travel.tripImages,
      ...queryKeys.travel.tripsWithImages,
      ...queryKeys.admin.images,
      ...queryKeys.admin.trips,
    ],
    table: 'trip_images',
  },
  {
    keys: [
      ...queryKeys.blog.list,
      ...queryKeys.blog.postBase,
      ...queryKeys.blog.contentBase,
      ...queryKeys.admin.blog,
    ],
    table: 'blog',
  },
  {
    keys: [...queryKeys.guestbook.list, ...queryKeys.guestbook.latest, ...queryKeys.admin.guestbook],
    table: 'guestbook',
  },
  { keys: [...queryKeys.quotes, ...queryKeys.admin.quotes], table: 'quotes' },
  {
    keys: [queryKeys.workPeople.list[0], queryKeys.admin.workPeople[0]],
    table: 'work_people',
  },
]

// User roles have no public surface (their data is clearance/role metadata in
// the admin panel), but role changes must still invalidate the admin list.
const USER_ROLES_KEYS = [queryKeys.admin.userRoles[0]]

// Public keys that should be treated as "live" — always refetch on restore,
// never time-based staleness. Admin keys keep their own defaults.
export const LIVE_PUBLIC_PREFIXES: readonly string[] = [...new Set(
  LIVE_TABLES.flatMap((t) => t.keys.filter((key) => !key.startsWith('admin'))),
)]

export const LIVE_USER_ROLES_KEY = USER_ROLES_KEYS[0]