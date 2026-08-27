<template>
  <div class="bg-background text-text-primary min-h-[100svh] pb-24 select-text">
    <!-- Top Header -->
    <header
      class="border-border-primary bg-surface-primary/80 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md"
    >
      <div class="flex items-center gap-2">
        <span
          class="rounded-md bg-pink-500/10 px-2 py-0.5 text-xs font-semibold text-pink-600 dark:text-pink-400"
        >
          SUITLADY
        </span>
        <span class="text-text-tertiary text-xs">cms & admin</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="currentUser" class="text-ui-small text-text-secondary max-w-[120px] truncate">
          {{ currentUser.email?.split('@')[0] }}
        </span>
        <button
          class="border-border-primary text-text-secondary hover:bg-surface-secondary rounded-lg border px-2.5 py-1 text-xs transition active:scale-95"
          @click="router.push('/')"
        >
          Exit
        </button>
      </div>
    </header>

    <!-- Navigation Tabs (Mobile bottom bar / Sticky top sub-nav) -->
    <nav
      class="border-border-primary bg-surface-secondary/90 noscrollbar sticky top-[49px] z-20 flex overflow-x-auto border-b px-2 backdrop-blur-md"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors"
        :class="
          activeTab === tab.id
            ? 'border-text-primary text-text-primary'
            : 'text-text-tertiary hover:text-text-secondary border-transparent'
        "
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" :size="14" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count !== undefined"
          class="bg-surface-primary py-0.2 text-text-secondary border-border-primary ml-1 rounded-full border px-1.5 text-[10px]"
        >
          {{ tab.count }}
        </span>
      </button>
    </nav>

    <!-- Main Content Container -->
    <main class="mx-auto max-w-2xl px-4 pt-4">
      <!-- TAB 1: GUESTBOOK -->
      <section v-if="activeTab === 'guestbook'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-text-primary text-sm font-semibold">Guestbook Art & Signatures</h2>
          <button
            class="text-text-tertiary hover:text-text-primary text-xs transition"
            :disabled="isGuestbookLoading"
            @click="refetchGuestbook()"
          >
            Refresh
          </button>
        </div>

        <div v-if="isGuestbookLoading" class="flex justify-center py-12">
          <GenericLoader />
        </div>

        <div
          v-else-if="!guestbookEntries?.length"
          class="border-border-primary text-text-tertiary rounded-xl border border-dashed p-8 text-center text-xs"
        >
          No guestbook entries found.
        </div>

        <div v-else class="grid grid-cols-1 gap-4">
          <div
            v-for="entry in guestbookEntries"
            :key="entry.id"
            class="border-border-primary bg-surface-primary flex flex-col gap-3 rounded-xl border p-4 shadow-xs"
          >
            <!-- Canvas Preview -->
            <div
              class="border-border-primary relative aspect-video w-full overflow-hidden rounded-lg border bg-[#0f0f10]"
            >
              <svg class="h-full w-full">
                <path
                  v-for="(stroke, sIdx) in parseStrokes(entry.strokes)"
                  :key="sIdx"
                  :d="getSvgPathFromStroke(stroke)"
                  class="fill-pink-500"
                />
              </svg>
            </div>

            <!-- Author info & action -->
            <div class="flex items-center justify-between text-xs">
              <div class="flex flex-col">
                <span class="text-text-primary font-medium">{{
                  entry.display_name || 'Anonymous'
                }}</span>
                <span class="text-text-tertiary text-[10px]">
                  {{ formatDate(entry.created_at || entry.updated_at) }}
                </span>
              </div>
              <button
                class="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500/20 active:scale-95 dark:text-red-400"
                :disabled="deletingGuestbookId === entry.id"
                @click="deleteGuestbookEntry(entry.id)"
              >
                <Trash2 :size="13" />
                <span>{{ deletingGuestbookId === entry.id ? 'Deleting...' : 'Delete' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: WORK PEOPLE -->
      <section v-else-if="activeTab === 'work'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-text-primary text-sm font-semibold">Work People</h2>
            <select
              v-model="selectedOrg"
              class="border-border-primary bg-surface-secondary text-text-primary rounded-lg border px-2 py-1 text-xs outline-none"
            >
              <option value="all">All Orgs</option>
              <option v-for="org in orgOptions" :key="org" :value="org">{{ org }}</option>
            </select>
          </div>
          <button
            class="bg-text-primary text-surface-primary flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition active:scale-95"
            @click="openAddPersonModal"
          >
            <Plus :size="13" />
            <span>Add</span>
          </button>
        </div>

        <div v-if="isPeopleLoading" class="flex justify-center py-12">
          <GenericLoader />
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="person in filteredPeople"
            :key="`${person.orgId}-${person.name}`"
            class="border-border-primary bg-surface-primary flex flex-col gap-3 rounded-xl border p-3 shadow-xs"
          >
            <div class="flex items-start gap-3">
              <img
                :src="getWorkPersonUrl(person.orgId, person.imageName)"
                class="border-border-primary bg-surface-secondary size-12 shrink-0 rounded-full border object-cover"
                @error="handleImgError"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-text-primary truncate text-xs font-bold">{{
                      person.name
                    }}</span>
                    <span
                      class="bg-surface-secondary py-0.2 text-text-tertiary rounded px-1.5 text-[10px]"
                    >
                      {{ person.orgId }}
                    </span>
                  </div>
                  <button
                    class="text-text-tertiary p-1 transition hover:text-red-500"
                    title="Delete person"
                    @click="deletePerson(person.orgId, person.name)"
                  >
                    <Trash2 :size="13" />
                  </button>
                </div>
                <p v-if="person.quote" class="text-text-secondary mt-1 line-clamp-2 text-xs italic">
                  “{{ person.quote }}”
                </p>
                <p v-else class="text-text-tertiary mt-1 text-[11px] italic">No quote</p>
              </div>
            </div>

            <!-- Quick Edit Row Form -->
            <div class="border-border-primary/60 grid grid-cols-1 gap-2 border-t pt-2 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-text-tertiary text-[10px]">Image File (e.g. adil)</label>
                  <input
                    v-model="person.imageName"
                    class="border-border-primary bg-surface-secondary text-text-primary focus:border-text-primary w-full rounded-md border px-2 py-1 text-xs outline-none"
                    placeholder="image name"
                  />
                </div>
                <div>
                  <label class="text-text-tertiary text-[10px]">LinkedIn URL</label>
                  <input
                    v-model="person.linkedin"
                    class="border-border-primary bg-surface-secondary text-text-primary focus:border-text-primary w-full rounded-md border px-2 py-1 text-xs outline-none"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
              <div>
                <label class="text-text-tertiary text-[10px]">Quote</label>
                <textarea
                  v-model="person.quote"
                  rows="2"
                  class="border-border-primary bg-surface-secondary text-text-primary focus:border-text-primary w-full resize-none rounded-md border px-2 py-1 text-xs outline-none"
                  placeholder="Quote (optional)"
                />
              </div>
              <div class="flex justify-end">
                <button
                  class="bg-surface-secondary border-border-primary text-text-primary hover:bg-surface-tertiary flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium transition active:scale-95"
                  :disabled="savingPersonKey === `${person.orgId}-${person.name}`"
                  @click="savePerson(person)"
                >
                  <Check :size="12" />
                  <span>{{
                    savingPersonKey === `${person.orgId}-${person.name}`
                      ? 'Saving...'
                      : 'Save Changes'
                  }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Person Modal / Drawer -->
        <div
          v-if="showAddPerson"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            class="border-border-primary bg-surface-primary flex w-full max-w-sm flex-col gap-3 rounded-xl border p-4 shadow-xl"
          >
            <div class="border-border-primary flex items-center justify-between border-b pb-2">
              <h3 class="text-text-primary text-sm font-semibold">Add Work Colleague</h3>
              <button
                class="text-text-tertiary hover:text-text-primary"
                @click="showAddPerson = false"
              >
                <X :size="16" />
              </button>
            </div>
            <div class="flex flex-col gap-2 text-xs">
              <div>
                <label class="text-text-tertiary text-[10px]">Company (orgId)</label>
                <input
                  v-model="newPerson.orgId"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
                  placeholder="e.g. dezerv, quizizz"
                />
              </div>
              <div>
                <label class="text-text-tertiary text-[10px]">Full Name</label>
                <input
                  v-model="newPerson.name"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label class="text-text-tertiary text-[10px]">Image Name in Storage</label>
                <input
                  v-model="newPerson.imageName"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
                  placeholder="e.g. john"
                />
              </div>
              <div>
                <label class="text-text-tertiary text-[10px]">LinkedIn Profile</label>
                <input
                  v-model="newPerson.linkedin"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label class="text-text-tertiary text-[10px]">Quote</label>
                <textarea
                  v-model="newPerson.quote"
                  rows="2"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full resize-none rounded-md border px-2.5 py-1.5 text-xs outline-none"
                  placeholder="What did they say?"
                />
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                class="border-border-primary text-text-secondary rounded-md border px-3 py-1.5 text-xs"
                @click="showAddPerson = false"
              >
                Cancel
              </button>
              <button
                class="bg-text-primary text-surface-primary rounded-md px-3 py-1.5 text-xs font-medium"
                @click="createPerson"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 3: TRIPS & CLEARANCE -->
      <section v-else-if="activeTab === 'trips'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-text-primary text-sm font-semibold">Trips Editor</h2>
          <span class="text-text-tertiary text-xs">{{ trips?.length || 0 }} trips</span>
        </div>

        <div v-if="isTripsLoading" class="flex justify-center py-12">
          <GenericLoader />
        </div>

        <div v-else class="flex flex-col gap-4">
          <div
            v-for="trip in trips"
            :key="trip.slug"
            class="border-border-primary bg-surface-primary flex flex-col gap-3 rounded-xl border p-4 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-text-primary text-sm font-bold">{{ trip.title }}</span>
                <span class="text-text-tertiary text-[11px]"
                  >{{ trip.slug }} • {{ trip.date ? formatDate(trip.date) : '' }}</span
                >
              </div>
              <span
                class="rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase"
                :class="clearanceBadgeColor(trip.clearance)"
              >
                {{ trip.clearance }}
              </span>
            </div>

            <!-- Form fields for Title, Subtitle, Clearance, Description -->
            <div class="grid grid-cols-1 gap-2.5 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-text-tertiary text-[10px]">Title</label>
                  <input
                    v-model="trip.title"
                    class="border-border-primary bg-surface-secondary text-text-primary focus:border-text-primary w-full rounded-md border px-2 py-1 text-xs outline-none"
                  />
                </div>
                <div>
                  <label class="text-text-tertiary text-[10px]">Subtitle</label>
                  <input
                    v-model="trip.subtitle"
                    class="border-border-primary bg-surface-secondary text-text-primary focus:border-text-primary w-full rounded-md border px-2 py-1 text-xs outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 items-center gap-2">
                <div>
                  <label class="text-text-tertiary text-[10px]">Clearance Level</label>
                  <select
                    v-model="trip.clearance"
                    class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2 py-1 text-xs outline-none"
                  >
                    <option v-for="lvl in clearanceLevels" :key="lvl" :value="lvl">
                      {{ lvl }}
                    </option>
                  </select>
                </div>
                <div class="flex items-center gap-2 pt-3">
                  <input
                    :id="`repeat-${trip.slug}`"
                    v-model="trip.repeat_visit"
                    type="checkbox"
                    class="border-border-primary rounded accent-pink-600"
                  />
                  <label
                    :for="`repeat-${trip.slug}`"
                    class="text-text-secondary cursor-pointer text-xs"
                    >Repeat Visit</label
                  >
                </div>
              </div>

              <div>
                <label class="text-text-tertiary text-[10px]"
                  >Description Paragraphs (one per line)</label
                >
                <textarea
                  :value="
                    Array.isArray(trip.description) ? trip.description.join('\n') : trip.description
                  "
                  rows="3"
                  class="border-border-primary bg-surface-secondary text-text-primary focus:border-text-primary w-full resize-y rounded-md border px-2 py-1 text-xs outline-none"
                  placeholder="Trip description lines..."
                  @input="
                    (e) => (trip.description = (e.target as HTMLTextAreaElement).value.split('\n'))
                  "
                />
              </div>

              <div class="flex items-center justify-between pt-1">
                <button
                  class="flex items-center gap-1 text-xs text-pink-600 hover:underline dark:text-pink-400"
                  @click="openTripImages(trip.slug)"
                >
                  <ImageIcon :size="12" />
                  <span>View Photos ({{ getTripImageCount(trip.slug) }})</span>
                </button>
                <button
                  class="bg-text-primary text-surface-primary flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition active:scale-95"
                  :disabled="savingTripSlug === trip.slug"
                  @click="saveTrip(trip)"
                >
                  <Check :size="12" />
                  <span>{{ savingTripSlug === trip.slug ? 'Saving...' : 'Save Trip' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 4: TRIP IMAGES -->
      <section v-else-if="activeTab === 'images'" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h2 class="text-text-primary text-sm font-semibold">Trip Photos CMS</h2>
            <select
              v-model="selectedTripFilter"
              class="border-border-primary bg-surface-secondary text-text-primary rounded-lg border px-2 py-1 text-xs outline-none"
            >
              <option value="all">All Trips ({{ allImages?.length || 0 }})</option>
              <option v-for="t in trips" :key="t.slug" :value="t.slug">
                {{ t.title }} ({{ getTripImageCount(t.slug) }})
              </option>
            </select>
          </div>
          <p class="text-text-tertiary text-[11px]">
            Loaded thumbnails with full preview. Adjust clearance or add captions directly.
          </p>
        </div>

        <div v-if="isImagesLoading" class="flex justify-center py-12">
          <GenericLoader />
        </div>

        <div
          v-else-if="!filteredImages?.length"
          class="border-border-primary text-text-tertiary rounded-xl border border-dashed p-8 text-center text-xs"
        >
          No images found for this filter.
        </div>

        <div v-else class="grid grid-cols-1 gap-4">
          <div
            v-for="img in filteredImages"
            :key="img.id"
            class="border-border-primary bg-surface-primary flex flex-col gap-3 rounded-xl border p-3 shadow-xs"
          >
            <!-- Loaded image container -->
            <div
              class="border-border-primary bg-surface-secondary relative overflow-hidden rounded-lg border"
            >
              <img
                :src="getImageUrl(img.storage_path)"
                :alt="img.storage_path"
                loading="lazy"
                class="max-h-72 w-full bg-black/5 object-contain"
              />
              <span
                class="absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md"
                :class="clearanceBadgeColor(img.clearance)"
              >
                {{ img.clearance }}
              </span>
              <span
                class="absolute right-2 bottom-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
              >
                {{ img.trip_slug }}
              </span>
            </div>

            <!-- Image Metadata / Edit form -->
            <div class="flex flex-col gap-2 text-xs">
              <div class="grid grid-cols-2 items-center gap-2">
                <div>
                  <label class="text-text-tertiary text-[10px]">Clearance</label>
                  <select
                    v-model="img.clearance"
                    class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2 py-1 text-xs outline-none"
                  >
                    <option v-for="lvl in clearanceLevels" :key="lvl" :value="lvl">
                      {{ lvl }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="text-text-tertiary text-[10px]">File Name</label>
                  <p class="text-text-secondary truncate text-[11px]" :title="img.storage_path">
                    {{ img.storage_path.split('/').pop() }}
                  </p>
                </div>
              </div>

              <div>
                <label class="text-text-tertiary text-[10px]">Caption</label>
                <input
                  v-model="img.caption"
                  class="border-border-primary bg-surface-secondary text-text-primary focus:border-text-primary w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
                  placeholder="Add a caption..."
                />
              </div>

              <div class="flex justify-end pt-1">
                <button
                  class="bg-surface-secondary border-border-primary text-text-primary hover:bg-surface-tertiary flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium transition active:scale-95"
                  :disabled="savingImageId === img.id"
                  @click="saveImage(img)"
                >
                  <Check :size="12" />
                  <span>{{ savingImageId === img.id ? 'Saving...' : 'Save Photo' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 5: USER ROLES / ACCESS LEVELS -->
      <section v-else-if="activeTab === 'roles'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <h2 class="text-text-primary text-sm font-semibold">User Roles & Access Levels</h2>
            <p class="text-text-tertiary text-[11px]">
              Assign clearance hierarchy (admin, close, friends, known, auth, public)
            </p>
          </div>
          <button
            class="bg-text-primary text-surface-primary flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition active:scale-95"
            @click="showAddRoleModal = true"
          >
            <Plus :size="13" />
            <span>Add User Role</span>
          </button>
        </div>

        <div v-if="isRolesLoading" class="flex justify-center py-12">
          <GenericLoader />
        </div>

        <div
          v-else-if="!userRolesList?.length"
          class="border-border-primary text-text-tertiary rounded-xl border border-dashed p-8 text-center text-xs"
        >
          No custom roles assigned yet.
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="uRole in userRolesList"
            :key="uRole.user_id"
            class="border-border-primary bg-surface-primary flex flex-col gap-3 rounded-xl border p-4 shadow-xs"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 flex-col">
                <div class="flex items-center gap-2">
                  <span class="text-text-primary truncate text-xs font-bold">
                    {{ uRole.full_name || 'No Name' }}
                  </span>
                  <span
                    class="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                    :class="clearanceBadgeColor(uRole.role)"
                  >
                    {{ uRole.role }}
                  </span>
                </div>
                <span v-if="uRole.email" class="text-text-secondary truncate text-[11px]">
                  {{ uRole.email }}
                </span>
                <span
                  class="text-text-tertiary truncate font-mono text-[10px]"
                  :title="uRole.user_id"
                >
                  ID: {{ uRole.user_id }}
                </span>
                <span class="text-text-tertiary text-[10px]">
                  Added {{ formatDate(uRole.created_at) }}
                </span>
              </div>
              <button
                class="text-text-tertiary p-1 transition hover:text-red-500"
                title="Remove Role"
                @click="deleteUserRole(uRole.user_id)"
              >
                <Trash2 :size="13" />
              </button>
            </div>

            <div class="border-border-primary/60 grid grid-cols-2 items-center gap-2 border-t pt-1">
              <div>
                <label class="text-text-tertiary text-[10px]">Access Level</label>
                <select
                  v-model="uRole.role"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2 py-1 text-xs outline-none"
                >
                  <option v-for="lvl in clearanceLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
                </select>
              </div>
              <div class="flex justify-end pt-3">
                <button
                  class="bg-surface-secondary border-border-primary text-text-primary hover:bg-surface-tertiary flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium transition active:scale-95"
                  :disabled="savingUserId === uRole.user_id"
                  @click="saveUserRole(uRole)"
                >
                  <Check :size="12" />
                  <span>{{ savingUserId === uRole.user_id ? 'Saving...' : 'Save Role' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add User Role Modal -->
        <div
          v-if="showAddRoleModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            class="border-border-primary bg-surface-primary flex w-full max-w-sm flex-col gap-3 rounded-xl border p-4 shadow-xl"
          >
            <div class="border-border-primary flex items-center justify-between border-b pb-2">
              <h3 class="text-text-primary text-sm font-semibold">Assign Role by User ID</h3>
              <button
                class="text-text-tertiary hover:text-text-primary"
                @click="showAddRoleModal = false"
              >
                <X :size="16" />
              </button>
            </div>
            <div class="flex flex-col gap-2 text-xs">
              <div>
                <label class="text-text-tertiary text-[10px]">User UUID (from auth.users)</label>
                <input
                  v-model="newRole.user_id"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2.5 py-1.5 font-mono text-xs outline-none"
                  placeholder="e.g. e831785e-f7d7-43d6-b098-..."
                />
              </div>
              <div>
                <label class="text-text-tertiary text-[10px]">Role / Clearance</label>
                <select
                  v-model="newRole.role"
                  class="border-border-primary bg-surface-secondary text-text-primary w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
                >
                  <option v-for="lvl in clearanceLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                class="border-border-primary text-text-secondary rounded-md border px-3 py-1.5 text-xs"
                @click="showAddRoleModal = false"
              >
                Cancel
              </button>
              <button
                class="bg-text-primary text-surface-primary rounded-md px-3 py-1.5 text-xs font-medium"
                @click="createUserRole"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Success / Error Toast Notification -->
    <div
      v-if="toastMsg"
      class="border-border-primary bg-surface-primary/95 text-text-primary fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 animate-bounce items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-all"
    >
      <span>{{ toastMsg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  Globe,
  Image as ImageIcon,
  KeyRound,
  PenTool,
  Plus,
  Trash2,
  Users,
  X,
} from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { getStroke } from 'perfect-freehand'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import GenericLoader from '@/components/GenericLoader.vue'
import { currentUser, isAdmin } from '@/composables/useAuth'
import { getStorageUrl, supabase } from '@/supabase'

import type { ClearanceLevel } from '@/composables/useTravel'

const router = useRouter()
const queryClient = useQueryClient()

const clearanceLevels: ClearanceLevel[] = ['public', 'auth', 'known', 'friends', 'close', 'admin']
const activeTab = ref<'guestbook' | 'images' | 'roles' | 'trips' | 'work'>('guestbook')
const toastMsg = ref<null | string>(null)

// ----------------------------------------------------
// TABS CONFIG
// ----------------------------------------------------
type AdminTab = 'guestbook' | 'images' | 'roles' | 'trips' | 'work'

function showToast(msg: string) {
  toastMsg.value = msg
  setTimeout(() => {
    toastMsg.value = null
  }, 2500)
}

const tabs = computed<{ count?: number; icon: any; id: AdminTab; label: string }[]>(() => [
  { count: guestbookEntries.value?.length, icon: PenTool, id: 'guestbook', label: 'Guestbook' },
  { count: workPeople.value?.length, icon: Users, id: 'work', label: 'Work People' },
  { count: trips.value?.length, icon: Globe, id: 'trips', label: 'Trips' },
  { count: allImages.value?.length, icon: ImageIcon, id: 'images', label: 'Photos' },
  { count: userRolesList.value?.length, icon: KeyRound, id: 'roles', label: 'Roles' },
])

// ----------------------------------------------------
// TAB 1: GUESTBOOK
// ----------------------------------------------------
const deletingGuestbookId = ref<null | string>(null)

const {
  data: guestbookEntries,
  isLoading: isGuestbookLoading,
  refetch: refetchGuestbook,
} = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  queryKey: ['admin-guestbook'],
})

async function deleteGuestbookEntry(id: string) {
  if (!confirm('Are you sure you want to delete this guestbook entry?')) return
  deletingGuestbookId.value = id
  const { error } = await supabase.from('guestbook').delete().eq('id', id)
  deletingGuestbookId.value = null
  if (error) {
    showToast(`Error deleting: ${error.message}`)
  } else {
    showToast('Guestbook entry deleted')
    queryClient.invalidateQueries({ queryKey: ['admin-guestbook'] })
    queryClient.invalidateQueries({ queryKey: ['guestbook', 'latest'] })
  }
}

function getSvgPathFromStroke(points: number[][]) {
  if (!points?.length) return ''
  const outline = getStroke(points, {
    size: 4,
    smoothing: 0.7,
    streamline: 0.3,
    thinning: 0.5,
  })
  if (!outline.length) return ''
  const d = outline.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...outline[0], 'Q'],
  )
  d.push('Z')
  return d.join(' ')
}

function parseStrokes(raw: unknown): number[][][] {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  return raw as number[][][]
}

// ----------------------------------------------------
// TAB 2: WORK PEOPLE
// ----------------------------------------------------
const selectedOrg = ref<string>('all')
const savingPersonKey = ref<null | string>(null)
const showAddPerson = ref(false)
const newPerson = ref({ imageName: '', linkedin: '', name: '', orgId: '', quote: '' })

const {
  data: workPeople,
  isLoading: isPeopleLoading,
  refetch: refetchPeople,
} = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('work_people')
      .select('*')
      .order('orgId', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return data || []
  },
  queryKey: ['admin-work-people'],
})

const orgOptions = computed(() => {
  const orgs = new Set<string>()
  workPeople.value?.forEach((p) => {
    if (p.orgId) orgs.add(p.orgId)
  })
  return Array.from(orgs).sort()
})

const filteredPeople = computed(() => {
  if (!workPeople.value) return []
  if (selectedOrg.value === 'all') return workPeople.value
  return workPeople.value.filter((p) => p.orgId === selectedOrg.value)
})

async function createPerson() {
  if (!newPerson.value.orgId || !newPerson.value.name) {
    alert('Please provide at least orgId and Name')
    return
  }
  const { error } = await supabase.from('work_people').insert({
    imageName: newPerson.value.imageName || newPerson.value.name.toLowerCase().replace(/\s+/g, ''),
    linkedin: newPerson.value.linkedin || null,
    name: newPerson.value.name,
    orgId: newPerson.value.orgId,
    quote: newPerson.value.quote || null,
  })

  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast(`Added ${newPerson.value.name}`)
    showAddPerson.value = false
    queryClient.invalidateQueries({ queryKey: ['work-people'] })
    queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
  }
}

async function deletePerson(orgId: string, name: string) {
  if (!confirm(`Delete ${name} from ${orgId}?`)) return
  const { error } = await supabase.from('work_people').delete().match({ name, orgId })

  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast(`Deleted ${name}`)
    queryClient.invalidateQueries({ queryKey: ['work-people'] })
    queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
  }
}

function getWorkPersonUrl(orgId: string, filename: string) {
  if (!filename) return ''
  const name = filename.replace(/\.[^/.]+$/, '')
  return getStorageUrl('webp', orgId, `${name}.webp`)
}

function handleImgError(e: Event) {
  ;(e.target as HTMLElement).style.opacity = '0.3'
}

function openAddPersonModal() {
  newPerson.value = {
    imageName: '',
    linkedin: '',
    name: '',
    orgId: selectedOrg.value !== 'all' ? selectedOrg.value : '',
    quote: '',
  }
  showAddPerson.value = true
}

async function savePerson(person: any) {
  const key = `${person.orgId}-${person.name}`
  savingPersonKey.value = key
  const { error } = await supabase
    .from('work_people')
    .update({
      imageName: person.imageName,
      linkedin: person.linkedin || null,
      quote: person.quote || null,
    })
    .match({ name: person.name, orgId: person.orgId })

  savingPersonKey.value = null
  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast(`Updated ${person.name}`)
    queryClient.invalidateQueries({ queryKey: ['work-people'] })
    queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
  }
}

// ----------------------------------------------------
// TAB 3: TRIPS
// ----------------------------------------------------
const savingTripSlug = ref<null | string>(null)

const {
  data: trips,
  isLoading: isTripsLoading,
  refetch: refetchTrips,
} = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return data || []
  },
  queryKey: ['admin-trips'],
})

function openTripImages(slug: string) {
  selectedTripFilter.value = slug
  activeTab.value = 'images'
}

async function saveTrip(trip: any) {
  savingTripSlug.value = trip.slug
  const { error } = await supabase
    .from('trips')
    .update({
      clearance: trip.clearance,
      description: Array.isArray(trip.description) ? trip.description : [trip.description],
      repeat_visit: !!trip.repeat_visit,
      subtitle: trip.subtitle,
      title: trip.title,
    })
    .eq('slug', trip.slug)

  savingTripSlug.value = null
  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast(`Updated ${trip.title}`)
    queryClient.invalidateQueries({ queryKey: ['trips'] })
    queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
    queryClient.invalidateQueries({ queryKey: ['admin-trips'] })
  }
}

// ----------------------------------------------------
// TAB 4: TRIP IMAGES
// ----------------------------------------------------
const selectedTripFilter = ref<string>('all')
const savingImageId = ref<null | string>(null)

const {
  data: allImages,
  isLoading: isImagesLoading,
  refetch: refetchImages,
} = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('trip_images')
      .select('*')
      .order('date_taken', { ascending: false })
    if (error) throw error
    return data || []
  },
  queryKey: ['admin-images'],
})

const filteredImages = computed(() => {
  if (!allImages.value) return []
  if (selectedTripFilter.value === 'all') return allImages.value
  return allImages.value.filter((img) => img.trip_slug === selectedTripFilter.value)
})

function clearanceBadgeColor(clearance: string) {
  switch (clearance) {
    case 'admin':
      return 'bg-red-500/10 text-red-600 dark:text-red-400'
    case 'auth':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    case 'close':
      return 'bg-green-500/10 text-green-600 dark:text-green-400'
    case 'friends':
      return 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
    case 'known':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    case 'public':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    default:
      return 'bg-surface-secondary text-text-tertiary'
  }
}

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function formatDate(date: Date | null | string) {
  if (!date) return ''
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch {
    return String(date)
  }
}

function getImageUrl(storagePath: string) {
  return getStorageUrl('travel', storagePath)
}

function getTripImageCount(slug: string) {
  if (!allImages.value) return 0
  return allImages.value.filter((img) => img.trip_slug === slug).length
}

async function saveImage(img: any) {
  savingImageId.value = img.id
  const { error } = await supabase
    .from('trip_images')
    .update({
      caption: img.caption || null,
      clearance: img.clearance,
    })
    .eq('id', img.id)

  savingImageId.value = null
  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast('Image updated')
    queryClient.invalidateQueries({ queryKey: ['trip-images'] })
    queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
    queryClient.invalidateQueries({ queryKey: ['admin-images'] })
  }
}

// ----------------------------------------------------
// TAB 5: USER ROLES
// ----------------------------------------------------

const savingUserId = ref<null | string>(null)
const showAddRoleModal = ref(false)
const newRole = ref<{ role: ClearanceLevel; user_id: string }>({ role: 'auth', user_id: '' })

interface UserRoleRecord {
  created_at: string
  email?: string
  full_name?: string
  role: ClearanceLevel
  user_id: string
}

const {
  data: userRolesList,
  isLoading: isRolesLoading,
  refetch: refetchUserRoles,
} = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    await supabase.auth.getSession()

    // Query the view with joined auth profile
    const { data: viewData, error: viewError } = await supabase
      .from('admin_user_roles_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (viewError) {
      console.warn('admin_user_roles_view query failed:', viewError)
      // Fallback to plain user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as UserRoleRecord[]
    }

    return (viewData || []) as UserRoleRecord[]
  },
  queryKey: ['admin-user-roles'],
})

async function createUserRole() {
  if (!newRole.value.user_id) {
    alert('Please enter a user ID')
    return
  }
  const { error } = await supabase.from('user_roles').insert({
    role: newRole.value.role,
    user_id: newRole.value.user_id.trim(),
  })

  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast('Role assigned')
    showAddRoleModal.value = false
    newRole.value = { role: 'auth', user_id: '' }
    queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  }
}

async function deleteUserRole(userId: string) {
  if (!confirm('Remove this custom role? User will fall back to default auth/public level.')) return
  const { error } = await supabase.from('user_roles').delete().eq('user_id', userId)

  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast('Role deleted')
    queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  }
}

async function saveUserRole(uRole: UserRoleRecord) {
  savingUserId.value = uRole.user_id
  const { error } = await supabase
    .from('user_roles')
    .update({ role: uRole.role })
    .eq('user_id', uRole.user_id)

  savingUserId.value = null
  if (error) {
    showToast(`Error: ${error.message}`)
  } else {
    showToast('Role updated')
    queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  }
}
</script>

<style scoped>
@reference "@/style.css";
</style>
