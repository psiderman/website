<template>
  <div class="flex h-screen w-full items-center justify-center bg-zinc-950">
    <div class="bg-background mx-auto flex h-dvh w-full max-w-120 flex-col overflow-hidden">
      <TabGroup
        :selected-index="selectedTab"
        as="div"
        class="flex size-full flex-col overflow-hidden"
        @change="(index: number) => (selectedTab = index)"
      >
        <div
          class="bg-surface-inverted text-text-inverted-primary text-ui flex items-center justify-center border-b border-transparent p-2"
        >
          suitlady v1.1
        </div>
        <TabList
          class="border-border-primary noscrollbar flex w-full flex-row gap-1 overflow-scroll border-b"
        >
          <Tab v-for="tab in tabs" :key="tab.name" v-slot="{ selected }" as="template">
            <button
              class="text-ui flex cursor-pointer flex-row items-center justify-center gap-2 border-b-2 p-2 transition-colors outline-none"
              :class="
                selected
                  ? 'border-surface-inverted text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary border-transparent'
              "
            >
              <component :is="tab.icon" :size="16" />
              <span>{{ tab.name }}</span>
            </button>
          </Tab>
        </TabList>

        <TabPanels
          ref="scrollContainer"
          class="relative size-full overflow-auto"
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <!-- Pull to Refresh Indicator -->
          <div
            class="pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center justify-center transition-all duration-150 ease-out"
            :style="{
              height: `${pullDistance}px`,
              opacity: pullDistance > 0 ? Math.min(pullDistance / pullThreshold, 1) : 0,
              transform: `translateY(${Math.min(pullDistance, pullThreshold * 1.5)}px)`,
            }"
          >
            <div
              class="bg-surface-primary border-border-primary flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
            >
              <Loader
                :size="16"
                :class="['text-text-primary', isRefreshing ? 'animate-spin' : '']"
                :style="{
                  transform: !isRefreshing ? `rotate(${pullDistance * 3}deg)` : undefined,
                }"
              />
              <span class="text-ui-small text-text-secondary">
                {{
                  isRefreshing
                    ? 'Refreshing...'
                    : pullDistance > pullThreshold
                      ? 'Release to refresh'
                      : 'Pull to refresh'
                }}
              </span>
            </div>
          </div>

          <!-- Roles Tab Panel -->
          <TabPanel class="outline-none">
            <div v-for="user in sortedUserRolesList" :key="user.user_id">
              <div
                class="border-border-primary relative flex w-full flex-row items-center justify-between gap-4 border-b px-4 py-4"
              >
                <button
                  type="button"
                  class="flex min-w-0 flex-1 flex-row items-center gap-2 text-left"
                  :aria-expanded="expandedUserId === user.user_id"
                  @click="toggleUserExpand(user.user_id)"
                >
                  <div
                    class="border-border-primary bg-surface-secondary size-8 shrink-0 overflow-hidden rounded-full border"
                  >
                    <img
                      v-if="user.avatar_url"
                      :src="user.avatar_url"
                      :alt="user.full_name || 'User avatar'"
                      referrerpolicy="no-referrer"
                      class="size-full object-cover"
                      @error="user.avatar_url = undefined"
                    />
                    <div
                      v-else
                      class="text-text-tertiary flex size-full items-center justify-center font-medium uppercase"
                    >
                      {{ (user.full_name || user.email || 'U').charAt(0) }}
                    </div>
                  </div>
                  <div class="flex min-w-0 flex-1 flex-col">
                    <div class="flex items-center gap-1.5">
                      <p class="text-text-primary truncate font-medium">
                        {{ user.full_name }}
                      </p>
                      <span
                        v-if="user.isOnline"
                        v-tooltip="{ content: 'Online now', allowHTML: true }"
                        class="relative flex size-2 shrink-0 items-center justify-center"
                      >
                        <span
                          class="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75"
                        ></span>
                        <span
                          class="relative inline-flex size-1.5 rounded-full bg-green-500"
                        ></span>
                      </span>
                      <span
                        v-if="
                          user.role === 'auth' &&
                          (user.requested_clearance || user.requestedClearance)
                        "
                        v-tooltip="{ content: 'Requested access to “the list”', allowHTML: true }"
                        class="relative flex size-2 shrink-0 items-center justify-center"
                      >
                        <span
                          class="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75"
                        ></span>
                        <span
                          class="relative inline-flex size-1.5 rounded-full bg-green-500"
                        ></span>
                      </span>
                    </div>
                    <p class="text-text-tertiary text-mono truncate" :title="user.user_id">
                      {{ user.email }}
                    </p>
                  </div>
                </button>
                <div
                  class="text-ui border-border-primary bg-surface-primary relative inline-flex h-8 min-w-28 cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-0"
                >
                  <div class="flex flex-row items-center justify-start gap-1">
                    <div
                      :class="getRoleBadgeClass(pendingRoles[user.user_id] || user.role)"
                      class="h-4 w-1.5 rounded-full"
                    ></div>
                    <span>{{ pendingRoles[user.user_id] || user.role }}</span>
                  </div>

                  <ChevronDown :size="14" class="shrink-0 opacity-70" />

                  <select
                    v-model="pendingRoles[user.user_id]"
                    aria-label="Change user clearance role"
                    class="absolute inset-0 size-full cursor-pointer opacity-0"
                    @click.stop
                    @change="saveRole(user)"
                  >
                    <option v-for="role in clearanceLevels" :key="role" :value="role">
                      {{ role }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Page views panel -->
              <div
                v-if="expandedUserId === user.user_id"
                class="border-border-primary bg-surface-secondary border-b px-4 py-3"
              >
                <div class="flex flex-row items-center justify-between gap-2">
                  <p class="text-ui-small text-text-tertiary tracking-wider uppercase">
                    pages visited
                  </p>
                  <Loader
                    v-if="pageViewsLoading"
                    :size="12"
                    class="text-text-tertiary animate-spin"
                  />
                </div>
                <p v-if="pageViewsError" class="text-ui-small text-text-tertiary mt-2">
                  failed to load page views.
                </p>
                <ul
                  v-else-if="pageViews?.length"
                  class="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto"
                >
                  <li
                    v-for="pv in pageViews"
                    :key="pv.path"
                    class="flex min-w-0 flex-row items-center gap-2"
                  >
                    <span class="text-ui text-text-primary truncate">{{ pv.path }}</span>
                    <span
                      class="text-ui-small text-text-tertiary ml-auto shrink-0 whitespace-nowrap"
                    >
                      {{ pv.views }}× · {{ formatVisited(pv.last_visited_at) }}
                    </span>
                  </li>
                </ul>
                <p v-else class="text-ui-small text-text-tertiary mt-2">no page views yet.</p>
              </div>
            </div>
          </TabPanel>

          <!-- People Tab Panel -->
          <TabPanel class="outline-none">
            <div class="flex snap-x snap-mandatory overflow-x-auto p-4 pb-24">
              <div
                v-for="org in orgsWithPeople"
                :key="org.id"
                class="flex w-full shrink-0 snap-start scroll-m-4 flex-col gap-1 p-4"
              >
                <h3 class="text-ui-small text-text-tertiary tracking-wider uppercase">
                  {{ org.name }}
                </h3>

                <Disclosure
                  v-for="person in org.people"
                  :key="`${person.orgId}:${person.name}`"
                  v-slot="{ close }"
                  as="div"
                  class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
                >
                  <DisclosureButton class="w-full p-2 text-left">
                    <div class="flex items-center gap-2 not-last:pb-3">
                      <img
                        :src="getWorkPersonUrl(person.orgId, person.imageName)"
                        :alt="person.name"
                        class="size-8 rounded-full object-cover"
                        @error="(e: Event) => ((e.target as HTMLElement).style.display = 'none')"
                      />
                      <div class="flex min-w-0 flex-col gap-0">
                        <p class="text-ui text-text-primary">{{ person.name }}</p>
                        <div
                          class="inline-flex shrink-0 flex-row items-center justify-center gap-1"
                        >
                          <p
                            v-if="person.linkedin"
                            class="text-ui-small text-text-secondary w-full truncate"
                          >
                            {{ person.linkedin }}
                          </p>
                          <a
                            v-if="person.linkedin"
                            :href="person.linkedin"
                            target="_blank"
                            :aria-label="`${person.name} LinkedIn profile`"
                            @click.stop
                          >
                            <ExternalLink :size="12" class="text-text-tertiary" />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div v-if="person.quote" class="border-border-primary border-t pt-3">
                      <p class="text-p-small text-text-secondary border-l-2 pl-2 italic">
                        {{ person.quote }}
                      </p>
                    </div>
                  </DisclosureButton>

                  <DisclosurePanel
                    class="border-border-primary bg-surface-secondary flex flex-col gap-2 border-t p-4"
                  >
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Name</span>
                      <input
                        v-model="getEditForm(person).name"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Image Name</span>
                      <input
                        v-model="getEditForm(person).imageName"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">LinkedIn URL</span>
                      <input
                        v-model="getEditForm(person).linkedin"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Quote</span>
                      <textarea
                        v-model="getEditForm(person).quote"
                        rows="2"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                      ></textarea>
                    </label>
                    <div class="flex items-center justify-between gap-2 p-2">
                      <div class="flex gap-2">
                        <button
                          class="btn primary"
                          type="button"
                          :disabled="savingPersonKey === `${person.orgId}:${person.name}`"
                          @click="savePerson(person, close)"
                        >
                          {{
                            savingPersonKey === `${person.orgId}:${person.name}`
                              ? 'Saving...'
                              : 'Save'
                          }}
                        </button>
                        <button class="btn stroke" type="button" @click="resetPerson(person)">
                          Reset
                        </button>
                      </div>
                      <button
                        class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                        type="button"
                        @click="deletePerson(person)"
                      >
                        Delete
                      </button>
                    </div>
                  </DisclosurePanel>
                </Disclosure>
              </div>
            </div>
            <div
              class="bg-surface-secondary border-border-high-contrast fixed bottom-0 left-1/2 z-20 w-full max-w-120 -translate-x-1/2 border-t p-4"
            >
              <button class="btn primary w-full" type="button" @click="openAddPersonModal">
                <Plus :size="16" /> Add person
              </button>
            </div>
          </TabPanel>

          <!-- Trip Tab Panel -->
          <TabPanel class="outline-none">
            <div class="flex flex-col gap-3 p-4">
              <Disclosure
                v-for="trip in tripsList"
                :key="trip.slug"
                v-slot="{ close }"
                as="div"
                class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
              >
                <DisclosureButton
                  class="flex w-full cursor-pointer flex-row items-center justify-between p-3 text-left"
                >
                  <div class="flex min-w-0 flex-col gap-0">
                    <p class="text-ui text-text-primary truncate font-medium">{{ trip.title }}</p>
                    <p class="text-ui-small text-text-secondary truncate">
                      {{ trip.subtitle || formatTripDate(trip.date) }}
                    </p>
                  </div>

                  <div class="flex shrink-0 flex-row items-center gap-2">
                    <!-- Close Friends -->
                    <TheListIndicator
                      v-if="isHighClearance(trip.clearance)"
                      size="md"
                      :border="false"
                      tooltip
                    />

                    <!-- Repeat status -->
                    <div
                      v-if="trip.repeat_visit"
                      v-tooltip="{ content: 'Revisited' }"
                      class="text-text-secondary flex size-6 items-center justify-center"
                    >
                      <Repeat :size="16" />
                    </div>

                    <!-- Instagram Link Button -->
                    <a
                      v-if="trip.instagram_link"
                      v-tooltip="{ content: 'Instagram' }"
                      :href="trip.instagram_link"
                      target="_blank"
                      :aria-label="`${trip.title} Instagram`"
                      class="text-text-secondary hover:text-text-primary flex size-6 items-center justify-center"
                      @click.stop
                    >
                      <FA :icon="['fab', 'instagram']" class="text-ui" />
                    </a>

                    <!-- Google Maps list link button -->
                    <a
                      v-if="trip.maps_list_link"
                      v-tooltip="{ content: 'Maps' }"
                      :href="trip.maps_list_link"
                      target="_blank"
                      :aria-label="`${trip.title} Maps`"
                      class="text-text-secondary hover:text-text-primary flex size-6 items-center justify-center"
                      @click.stop
                    >
                      <Pin :size="16" />
                    </a>
                  </div>
                </DisclosureButton>

                <DisclosurePanel
                  class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
                >
                  <div class="flex flex-col gap-2">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Clearance</span>
                      <div
                        class="bg-surface-primary border-border-primary text-text-primary text-ui relative flex h-10.5 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                      >
                        <div class="flex flex-row gap-2">
                          <div
                            :class="getRoleBadgeClass(getEditTripForm(trip).clearance)"
                            class="h-6 w-1.5 rounded-full"
                          ></div>
                          <span>{{ getEditTripForm(trip).clearance }}</span>
                        </div>
                        <ChevronDown :size="14" class="shrink-0 opacity-70" />
                        <select
                          v-model="getEditTripForm(trip).clearance"
                          class="absolute inset-0 size-full cursor-pointer opacity-0"
                        >
                          <option v-for="level in clearanceLevels" :key="level" :value="level">
                            {{ level }}
                          </option>
                          <option value="public">public</option>
                        </select>
                      </div>
                    </label>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Title</span>
                      <input
                        v-model="getEditTripForm(trip).title"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Subtitle</span>
                      <input
                        v-model="getEditTripForm(trip).subtitle"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                        placeholder="e.g. November 2024"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Slug</span>
                      <input
                        v-model="getEditTripForm(trip).slug"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Date</span>
                      <input
                        v-model="getEditTripForm(trip).date"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="date"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    :aria-checked="getEditTripForm(trip).repeat_visit"
                    class="bg-surface-primary border-border-primary -mt-2 flex h-10.5 w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left select-none"
                    @click="
                      getEditTripForm(trip).repeat_visit = !getEditTripForm(trip).repeat_visit
                    "
                  >
                    <span class="text-ui text-text-primary">Repeat Visit</span>
                    <div
                      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out"
                      :class="
                        getEditTripForm(trip).repeat_visit
                          ? 'bg-surface-inverted'
                          : 'bg-surface-secondary border-border-primary border'
                      "
                    >
                      <span
                        class="bg-surface-primary inline-block size-3.5 transform rounded-full shadow transition duration-200 ease-in-out"
                        :class="
                          getEditTripForm(trip).repeat_visit ? 'translate-x-4.5' : 'translate-x-0.5'
                        "
                      />
                    </div>
                  </button>

                  <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                    <span class="pl-1.5">Description (one line per paragraph)</span>
                    <textarea
                      v-model="getEditTripForm(trip).descriptionText"
                      rows="3"
                      class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                      @input="
                        (e) =>
                          handleSmartApostrophes(
                            e,
                            (val) => (getEditTripForm(trip).descriptionText = val),
                          )
                      "
                    ></textarea>
                  </label>

                  <div class="flex flex-col gap-2">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Instagram Link</span>
                      <input
                        v-model="getEditTripForm(trip).instagram_link"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Maps Link</span>
                      <input
                        v-model="getEditTripForm(trip).maps_list_link"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>
                  </div>

                  <div class="flex items-center justify-between gap-2 pt-2">
                    <div class="flex gap-2">
                      <button
                        class="btn primary"
                        type="button"
                        :disabled="savingTripSlug === trip.slug"
                        @click="saveTrip(trip, close)"
                      >
                        {{ savingTripSlug === trip.slug ? 'Saving...' : 'Save' }}
                      </button>
                      <button class="btn stroke" type="button" @click="resetTrip(trip)">
                        Reset
                      </button>
                    </div>
                    <button
                      class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                      type="button"
                      @click="deleteTrip(trip.slug)"
                    >
                      Delete
                    </button>
                  </div>
                </DisclosurePanel>
              </Disclosure>
            </div>
          </TabPanel>

          <!-- Images Tab Panel -->
          <TabPanel class="h-full overflow-hidden outline-none">
            <div
              v-if="currentVisibleTrip"
              class="bg-surface-primary/95 border-border-primary fixed bottom-0 left-1/2 z-20 flex w-full max-w-120 -translate-x-1/2 items-center justify-between gap-2 border-t p-4 backdrop-blur-xs"
            >
              <div class="flex min-w-0 flex-col gap-0.5">
                <h3 class="text-ui text-text-primary truncate font-medium">
                  {{ currentVisibleTrip.title }}
                </h3>
                <p class="text-ui-small text-text-tertiary truncate">
                  {{ currentVisibleTrip.subtitle || formatTripDate(currentVisibleTrip.date) }}
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-1">
                <button
                  class="btn stroke icon-only"
                  :disabled="activeImageTripIndex <= 0"
                  aria-label="Previous trip"
                  type="button"
                  @click="scrollToTripIndex(activeImageTripIndex - 1)"
                >
                  <ChevronLeft :size="16" />
                </button>
                <button
                  class="btn stroke icon-only"
                  :disabled="activeImageTripIndex >= tripsWithImagesGrouped.length - 1"
                  aria-label="Next trip"
                  type="button"
                  @click="scrollToTripIndex(activeImageTripIndex + 1)"
                >
                  <ChevronRight :size="16" />
                </button>
              </div>
            </div>

            <div
              ref="imagesScrollContainer"
              class="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
              @scroll.passive="onImagesScroll"
            >
              <div
                v-for="trip in tripsWithImagesGrouped"
                :key="trip.slug"
                class="flex size-full shrink-0 snap-start scroll-m-4 flex-col gap-4 overflow-y-auto p-4 pb-28"
              >
                <!-- Public & Private Image Groups -->
                <div
                  v-for="group in [
                    { title: 'Public Images', images: trip.publicImages, isPublic: true },
                    { title: 'Private Images', images: trip.privateImages, isPublic: false },
                  ]"
                  :key="group.title"
                  class="flex flex-col gap-2"
                  :class="{ 'pt-2': !group.isPublic }"
                >
                  <span class="text-ui-small text-text-tertiary tracking-wider uppercase">
                    {{ group.title }} ({{ group.images.length }})
                  </span>

                  <p
                    v-if="group.images.length === 0"
                    class="text-ui-small text-text-tertiary italic"
                  >
                    No {{ group.isPublic ? 'public' : 'private' }} images
                  </p>

                  <div class="grid grid-cols-3 gap-2">
                    <Disclosure
                      v-for="img in group.images"
                      :key="img.id"
                      v-slot="{ close, open }"
                      as="template"
                    >
                      <div
                        :class="[
                          open ? 'col-span-3' : 'col-span-1',
                          savingImageId === img.id ? 'pointer-events-none opacity-50' : '',
                        ]"
                        class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border transition-opacity"
                      >
                        <DisclosureButton
                          class="relative aspect-square w-full cursor-pointer overflow-hidden text-left"
                        >
                          <img
                            :src="getTripThumbnailUrl(img.storage_path)"
                            :alt="img.caption || img.storage_path"
                            class="size-full object-cover"
                          />
                          <!-- Clearance overlay circle -->
                          <div
                            class="bg-light absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full p-0.5 backdrop-blur-xs"
                          >
                            <div
                              :class="getRoleBadgeClass(img.clearance)"
                              class="size-2.5 rounded-full"
                            ></div>
                          </div>
                          <!-- Truncated caption overlay -->
                          <div
                            v-if="img.caption"
                            class="from-dark/80 via-dark/40 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent p-1.5 pt-4"
                          >
                            <p class="text-ui-small text-light truncate leading-tight italic">
                              “{{ img.caption }}”
                            </p>
                          </div>
                        </DisclosureButton>

                        <DisclosurePanel
                          class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
                        >
                          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                            <span class="pl-1.5">Clearance</span>
                            <div
                              class="bg-surface-primary border-border-primary text-text-primary text-ui relative flex h-10.5 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                            >
                              <div class="flex flex-row items-center gap-2">
                                <div
                                  :class="getRoleBadgeClass(getEditImageForm(img).clearance)"
                                  class="h-5 w-1.5 rounded-full"
                                ></div>
                                <span>{{ getEditImageForm(img).clearance }}</span>
                              </div>
                              <ChevronDown :size="14" class="shrink-0 opacity-70" />
                              <select
                                v-model="getEditImageForm(img).clearance"
                                class="absolute inset-0 size-full cursor-pointer opacity-0"
                              >
                                <option
                                  v-for="level in clearanceLevels"
                                  :key="level"
                                  :value="level"
                                >
                                  {{ level }}
                                </option>
                              </select>
                            </div>
                          </label>

                          <div class="grid grid-cols-1 gap-3">
                            <div class="text-ui-small flex flex-col gap-1">
                              <span class="text-text-tertiary pl-1.5">Date Taken</span>
                              <div
                                class="bg-surface-primary border-border-primary text-text-secondary text-ui flex h-10.5 items-center gap-2 rounded-xl border px-3 py-2"
                              >
                                <Calendar :size="14" class="text-text-tertiary shrink-0" />
                                <span class="truncate">{{ formatImageDate(img.date_taken) }}</span>
                              </div>
                            </div>

                            <div class="text-ui-small flex flex-col gap-1">
                              <span class="text-text-tertiary pl-1.5">GPS Coordinates</span>
                              <div
                                class="bg-surface-primary border-border-primary text-text-secondary text-ui flex h-10.5 items-center justify-between gap-2 rounded-xl border px-3 py-2"
                              >
                                <div class="flex min-w-0 items-center gap-2">
                                  <MapPin :size="14" class="text-text-tertiary shrink-0" />
                                  <span class="text-mono truncate text-xs">
                                    {{ formatImageGps(img.lat, img.lng) }}
                                  </span>
                                </div>
                                <a
                                  v-if="
                                    img.lat !== null &&
                                    img.lat !== undefined &&
                                    img.lng !== null &&
                                    img.lng !== undefined
                                  "
                                  :href="`https://www.google.com/maps?q=${img.lat},${img.lng}`"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="text-text-tertiary hover:text-text-primary shrink-0 transition-colors"
                                  aria-label="Open location in Google Maps"
                                  title="Open in Google Maps"
                                >
                                  <ExternalLink :size="14" />
                                </a>
                              </div>
                            </div>
                          </div>

                          <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                            <div class="flex items-center justify-between pl-1.5">
                              <span>Caption</span>
                              <span class="text-ui-small text-text-tertiary">
                                {{ getEditImageForm(img).caption.length }}/150
                              </span>
                            </div>
                            <textarea
                              v-model="getEditImageForm(img).caption"
                              rows="3"
                              maxlength="150"
                              class="bg-surface-primary font-handwriting border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2 font-normal"
                              placeholder="Enter caption..."
                              @keydown.enter.exact.prevent="saveImage(img, close)"
                              @input="
                                (e) =>
                                  handleSmartApostrophes(
                                    e,
                                    (val) => (getEditImageForm(img).caption = val),
                                  )
                              "
                            ></textarea>
                          </label>

                          <div class="flex items-center justify-between gap-2 pt-1">
                            <div class="flex gap-2">
                              <button
                                class="btn primary"
                                type="button"
                                :disabled="savingImageId === img.id"
                                @click="saveImage(img, close)"
                              >
                                {{ savingImageId === img.id ? 'Saving...' : 'Save' }}
                              </button>
                              <button class="btn stroke" type="button" @click="resetImage(img)">
                                Reset
                              </button>
                            </div>
                            <button
                              class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                              type="button"
                              @click="deleteImage(img)"
                            >
                              Delete
                            </button>
                          </div>
                        </DisclosurePanel>
                      </div>
                    </Disclosure>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Guestbook Tab Panel -->
          <TabPanel class="outline-none">
            <div class="flex flex-col gap-4 p-4">
              <div
                v-for="entry in parsedGuestbookEntries"
                :key="entry.id"
                class="flex flex-col gap-2"
              >
                <div class="flex flex-row justify-between">
                  <span class="text-text-secondary text-ui-small uppercase">{{
                    format(new Date(entry.updated_at ?? ''), 'dd MMMM, yy HH:mm')
                  }}</span>
                  <button
                    class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                    @click="deleteGuestbookEntry(entry.id)"
                  >
                    Delete
                  </button>
                </div>
                <div class="drawing-board relative h-80! w-full">
                  <svg
                    class="size-full"
                    :viewBox="entry.viewBox"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path
                      v-for="(pathD, idx) in entry.svgPaths"
                      :key="idx"
                      :d="pathD"
                      class="fill-surface-inverted"
                    />
                  </svg>
                  <div
                    class="bg-surface-secondary text-ui text-text-tertiary border-border-high-contrast absolute right-0 bottom-0 flex flex-row items-center justify-center gap-1.5 rounded-tl-xl border-t border-l px-2 py-1"
                  >
                    <img
                      v-if="entry.avatar_url"
                      :src="entry.avatar_url"
                      :alt="entry.display_name || 'User avatar'"
                      referrerpolicy="no-referrer"
                      class="border-border-primary size-5 rounded-full border object-cover"
                      @error="entry.avatar_url = undefined"
                    />
                    <span class="max-w-60 truncate">
                      {{ entry.email || entry.display_name || 'Anonymous' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- Blog Tab Panel -->
          <TabPanel class="outline-none">
            <div class="flex flex-col gap-3 p-4">
              <Disclosure
                v-for="post in blogPostsList"
                :key="post.slug"
                v-slot="{ close }"
                as="div"
                class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
              >
                <DisclosureButton
                  class="flex w-full cursor-pointer flex-row items-center justify-between p-3 text-left"
                >
                  <div class="flex min-w-0 flex-col gap-0">
                    <p class="text-ui text-text-primary truncate font-medium">{{ post.title }}</p>
                    <p class="text-ui-small text-text-secondary truncate">
                      {{ formatBlogDate(post.date) }}
                    </p>
                  </div>
                  <div class="flex shrink-0 flex-row items-center gap-2">
                    <span class="text-ui-small text-text-tertiary px-2 uppercase">
                      {{ post.clearance }}
                    </span>
                    <span
                      v-if="!getEditBlogForm(post).is_active"
                      v-tooltip="{ content: 'Inactive' }"
                      class="text-text-secondary flex size-6 items-center justify-center"
                    >
                      <span class="size-2 rounded-full bg-red-500"></span>
                    </span>
                  </div>
                </DisclosureButton>

                <DisclosurePanel
                  class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
                >
                  <div class="flex flex-col gap-2">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Clearance</span>
                      <div
                        class="bg-surface-primary border-border-primary text-text-primary text-ui relative flex h-10.5 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                      >
                        <div class="flex flex-row gap-2">
                          <div
                            :class="getRoleBadgeClass(getEditBlogForm(post).clearance)"
                            class="h-6 w-1.5 rounded-full"
                          ></div>
                          <span>{{ getEditBlogForm(post).clearance }}</span>
                        </div>
                        <ChevronDown :size="14" class="shrink-0 opacity-70" />
                        <select
                          v-model="getEditBlogForm(post).clearance"
                          class="absolute inset-0 size-full cursor-pointer opacity-0"
                        >
                          <option v-for="level in clearanceLevels" :key="level" :value="level">
                            {{ level }}
                          </option>
                          <option value="public">public</option>
                        </select>
                      </div>
                    </label>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Title</span>
                      <input
                        v-model="getEditBlogForm(post).title"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Date</span>
                      <input
                        v-model="getEditBlogForm(post).date"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="date"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Minutes</span>
                      <input
                        v-model.number="getEditBlogForm(post).minutes"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="number"
                        min="0"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Slug</span>
                      <input
                        v-model="getEditBlogForm(post).slug"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Excerpt</span>
                      <textarea
                        v-model="getEditBlogForm(post).excerpt"
                        rows="3"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                      ></textarea>
                    </label>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    :aria-checked="getEditBlogForm(post).is_active"
                    class="bg-surface-primary border-border-primary -mt-2 flex h-10.5 w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left select-none"
                    @click="getEditBlogForm(post).is_active = !getEditBlogForm(post).is_active"
                  >
                    <span class="text-ui text-text-primary">Is Active</span>
                    <div
                      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out"
                      :class="
                        getEditBlogForm(post).is_active
                          ? 'bg-surface-inverted'
                          : 'bg-surface-secondary border-border-primary border'
                      "
                    >
                      <span
                        class="bg-surface-primary inline-block size-3.5 transform rounded-full shadow transition duration-200 ease-in-out"
                        :class="
                          getEditBlogForm(post).is_active ? 'translate-x-4.5' : 'translate-x-0.5'
                        "
                      />
                    </div>
                  </button>

                  <div class="flex items-center justify-between gap-2 pt-2">
                    <div class="flex gap-2">
                      <button
                        class="btn primary"
                        type="button"
                        :disabled="savingBlogSlug === post.slug"
                        @click="saveBlog(post, close)"
                      >
                        {{ savingBlogSlug === post.slug ? 'Saving...' : 'Save' }}
                      </button>
                      <button class="btn stroke" type="button" @click="resetBlog(post)">
                        Reset
                      </button>
                    </div>
                    <button
                      class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                      type="button"
                      @click="deleteBlog(post.slug)"
                    >
                      Delete
                    </button>
                  </div>
                </DisclosurePanel>
              </Disclosure>
            </div>
          </TabPanel>

          <!-- Quotes Tab Panel -->
          <TabPanel class="outline-none">
            <div class="flex flex-col gap-3 p-4">
              <div>
                <button
                  class="btn stroke text-ui-small flex w-full cursor-pointer items-center justify-center gap-1.5 py-2.5"
                  type="button"
                  @click="openAddQuoteModal"
                >
                  <Plus :size="16" /> Add quote
                </button>
              </div>

              <Disclosure
                v-for="quote in quotesList"
                :key="quote.id"
                v-slot="{ close }"
                as="div"
                class="bg-surface-primary border-border-primary overflow-hidden rounded-xl border"
              >
                <DisclosureButton
                  class="flex w-full cursor-pointer flex-row items-center justify-between p-3 text-left"
                >
                  <div class="flex min-w-0 flex-col gap-0">
                    <p class="text-ui text-text-primary truncate font-medium">
                      {{ quote.title || quote.content }}
                    </p>
                    <p class="text-ui-small text-text-secondary truncate">
                      {{ formatQuoteDate(quote.date)
                      }}<span v-if="quote.title"> · {{ quote.content }}</span>
                    </p>
                  </div>
                  <div class="flex shrink-0 flex-row items-center gap-2">
                    <div
                      class="text-ui border-border-primary bg-surface-primary relative inline-flex h-8 min-w-28 cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-0"
                    >
                      <div class="flex flex-row items-center justify-start gap-1">
                        <div
                          :class="getRoleBadgeClass(getEditQuoteForm(quote).clearance)"
                          class="h-4 w-1.5 rounded-full"
                        ></div>
                        <span>{{ getEditQuoteForm(quote).clearance }}</span>
                      </div>

                      <ChevronDown :size="14" class="shrink-0 opacity-70" />

                      <select
                        v-model="getEditQuoteForm(quote).clearance"
                        aria-label="Change quote clearance level"
                        class="absolute inset-0 size-full cursor-pointer opacity-0"
                        @click.stop
                        @change="saveQuoteClearance(quote)"
                      >
                        <option v-for="level in quoteClearanceLevels" :key="level" :value="level">
                          {{ level }}
                        </option>
                      </select>
                    </div>
                  </div>
                </DisclosureButton>

                <DisclosurePanel
                  class="border-border-primary bg-surface-secondary flex flex-col gap-3 border-t p-4"
                >
                  <div class="flex flex-col gap-2">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Clearance</span>
                      <div
                        class="text-ui border-border-primary bg-surface-primary relative inline-flex h-8 min-w-28 cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-0"
                      >
                        <div class="flex flex-row items-center justify-start gap-1">
                          <div
                            :class="getRoleBadgeClass(getEditQuoteForm(quote).clearance)"
                            class="h-4 w-1.5 rounded-full"
                          ></div>
                          <span>{{ getEditQuoteForm(quote).clearance }}</span>
                        </div>
                        <ChevronDown :size="14" class="shrink-0 opacity-70" />
                        <select
                          v-model="getEditQuoteForm(quote).clearance"
                          class="absolute inset-0 size-full cursor-pointer opacity-0"
                        >
                          <option v-for="level in quoteClearanceLevels" :key="level" :value="level">
                            {{ level }}
                          </option>
                        </select>
                      </div>
                    </label>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Title</span>
                      <input
                        v-model="getEditQuoteForm(quote).title"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                        placeholder="Optional title"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Date</span>
                      <input
                        v-model="getEditQuoteForm(quote).date"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="date"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Content</span>
                      <textarea
                        v-model="getEditQuoteForm(quote).content"
                        rows="4"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        placeholder="Quote content..."
                      ></textarea>
                    </label>
                  </div>

                  <div class="flex items-center justify-between gap-2 pt-2">
                    <div class="flex gap-2">
                      <button
                        class="btn primary"
                        type="button"
                        :disabled="savingQuoteId === quote.id"
                        @click="saveQuote(quote, close)"
                      >
                        {{ savingQuoteId === quote.id ? 'Saving...' : 'Save' }}
                      </button>
                      <button class="btn stroke" type="button" @click="resetQuote(quote)">
                        Reset
                      </button>
                    </div>
                    <button
                      class="text-ui-small cursor-pointer text-red-700 uppercase hover:underline"
                      type="button"
                      @click="deleteQuote(quote.id)"
                    >
                      Delete
                    </button>
                  </div>
                </DisclosurePanel>
              </Disclosure>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <!-- Add Person Bottom Sheet Modal -->
      <TransitionRoot appear :show="isAddPersonModalOpen" as="template">
        <Dialog as="div" class="relative z-50" @close="isAddPersonModalOpen = false">
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
            <div class="flex min-h-full items-end justify-center">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 translate-y-full"
                enter-to="opacity-100 translate-y-0"
                leave="duration-200 ease-in"
                leave-from="opacity-100 translate-y-0"
                leave-to="opacity-0 translate-y-full"
              >
                <DialogPanel
                  class="bg-surface-primary border-border-primary text-text-primary flex w-full max-w-120 flex-col gap-4 rounded-t-2xl border p-6 shadow-2xl"
                >
                  <div class="flex items-center justify-between">
                    <h3 class="text-h3 font-semibold">Add Person</h3>
                    <button
                      type="button"
                      aria-label="Close modal"
                      class="hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                      @click="isAddPersonModalOpen = false"
                    >
                      <X :size="18" />
                    </button>
                  </div>

                  <form class="flex flex-col gap-3" @submit.prevent="addPerson">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Organization</span>
                      <div
                        class="bg-surface-primary border-border-primary text-text-primary text-ui relative flex h-10.5 cursor-pointer items-center justify-between rounded-xl border px-3 py-2"
                      >
                        <span>
                          {{
                            availableOrgs.find((o) => o.id === newPersonForm.orgId)?.name ||
                            'Select organization'
                          }}
                        </span>
                        <ChevronDown :size="14" class="shrink-0 opacity-70" />
                        <select
                          v-model="newPersonForm.orgId"
                          class="absolute inset-0 size-full cursor-pointer opacity-0"
                          required
                        >
                          <option v-for="org in availableOrgs" :key="org.id" :value="org.id">
                            {{ org.name }}
                          </option>
                        </select>
                      </div>
                    </label>

                    <div class="flex items-center gap-4">
                      <div
                        class="bg-surface-secondary border-border-primary flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                      >
                        <img
                          v-if="imagePreviewUrl"
                          :src="imagePreviewUrl"
                          alt="Preview"
                          class="size-full object-cover"
                        />
                        <span v-else class="text-ui-small text-text-tertiary uppercase">
                          {{ newPersonForm.name ? newPersonForm.name.charAt(0) : '?' }}
                        </span>
                      </div>

                      <div class="flex flex-1 flex-col gap-1">
                        <span class="text-ui-small text-text-tertiary pl-1.5">Profile Picture</span>
                        <label
                          class="btn stroke text-ui-small flex w-fit cursor-pointer items-center gap-2"
                        >
                          <Upload :size="14" />
                          <span>{{
                            isConvertingImage
                              ? 'Converting...'
                              : selectedImageFile
                                ? 'Change image'
                                : 'Select image'
                          }}</span>
                          <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            :disabled="isConvertingImage"
                            @change="onImageFileSelected"
                          />
                        </label>
                        <p
                          v-if="selectedImageFile"
                          class="text-ui-small text-text-secondary truncate"
                        >
                          {{ selectedImageFile.name }} (400×400 .webp)
                        </p>
                      </div>
                    </div>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Name</span>
                      <input
                        v-model="newPersonForm.name"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                        placeholder="Full name"
                        required
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">LinkedIn URL</span>
                      <input
                        v-model="newPersonForm.linkedin"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Quote</span>
                      <textarea
                        v-model="newPersonForm.quote"
                        rows="2"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        placeholder="Optional quote"
                      ></textarea>
                    </label>

                    <div class="flex gap-2 pt-2">
                      <button
                        class="btn primary"
                        type="submit"
                        :disabled="isAddingPerson || !newPersonForm.name || !newPersonForm.orgId"
                      >
                        {{ isAddingPerson ? 'Adding...' : 'Add Person' }}
                      </button>
                      <button
                        class="btn stroke"
                        type="button"
                        @click="isAddPersonModalOpen = false"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>

      <!-- Add Quote Bottom Sheet Modal -->
      <TransitionRoot appear :show="isAddQuoteModalOpen" as="template">
        <Dialog as="div" class="relative z-50" @close="isAddQuoteModalOpen = false">
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
            <div class="flex min-h-full items-end justify-center">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 translate-y-full"
                enter-to="opacity-100 translate-y-0"
                leave="duration-200 ease-in"
                leave-from="opacity-100 translate-y-0"
                leave-to="opacity-0 translate-y-full"
              >
                <DialogPanel
                  class="bg-surface-primary border-border-primary text-text-primary flex w-full max-w-120 flex-col gap-4 rounded-t-2xl border p-6 shadow-2xl"
                >
                  <div class="flex items-center justify-between">
                    <h3 class="text-h3 font-semibold">Add Quote</h3>
                    <button
                      type="button"
                      aria-label="Close modal"
                      class="hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                      @click="isAddQuoteModalOpen = false"
                    >
                      <X :size="18" />
                    </button>
                  </div>

                  <form class="flex flex-col gap-3" @submit.prevent="addQuote">
                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Clearance</span>
                      <div
                        class="text-ui border-border-primary bg-surface-primary relative inline-flex h-8 min-w-28 cursor-pointer items-center justify-between gap-3 rounded-lg border px-2.5 py-0"
                      >
                        <div class="flex flex-row items-center justify-start gap-1">
                          <div
                            :class="getRoleBadgeClass(newQuoteForm.clearance)"
                            class="h-4 w-1.5 rounded-full"
                          ></div>
                          <span>{{ newQuoteForm.clearance }}</span>
                        </div>
                        <ChevronDown :size="14" class="shrink-0 opacity-70" />
                        <select
                          v-model="newQuoteForm.clearance"
                          class="absolute inset-0 size-full cursor-pointer opacity-0"
                        >
                          <option v-for="level in quoteClearanceLevels" :key="level" :value="level">
                            {{ level }}
                          </option>
                        </select>
                      </div>
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Title</span>
                      <input
                        v-model="newQuoteForm.title"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="text"
                        placeholder="Optional title"
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Date</span>
                      <input
                        v-model="newQuoteForm.date"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        type="date"
                        required
                      />
                    </label>

                    <label class="text-ui-small text-text-tertiary flex flex-col gap-1">
                      <span class="pl-1.5">Content</span>
                      <textarea
                        v-model="newQuoteForm.content"
                        rows="4"
                        class="bg-surface-primary border-border-primary text-text-primary text-ui rounded-xl border px-3 py-2"
                        placeholder="Short sentence / excerpt..."
                        required
                      ></textarea>
                    </label>

                    <div class="flex gap-2 pt-2">
                      <button
                        class="btn primary"
                        type="submit"
                        :disabled="isAddingQuote || !newQuoteForm.content.trim()"
                      >
                        {{ isAddingQuote ? 'Adding...' : 'Add Quote' }}
                      </button>
                      <button class="btn stroke" type="button" @click="isAddQuoteModalOpen = false">
                        Cancel
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  BriefcaseBusiness,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Feather,
  GalleryHorizontal,
  KeyRound,
  Loader,
  Luggage,
  MapPin,
  Notebook,
  Pencil,
  Pin,
  Plus,
  Repeat,
  Upload,
  X,
} from '@lucide/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { computed, reactive, ref, watch } from 'vue'

import TheListIndicator from '@/components/TheListIndicator.vue'
import { isAdmin } from '@/composables/useAuth'
import { activePresenceUsers, useLive } from '@/composables/useLive'
import { type ClearanceLevel, isHighClearance, sortTripImages } from '@/composables/useTravel'
import { workHistory } from '@/data/work'
import { getStorageUrl, supabase } from '@/supabase'
import { getStrokeBounds, getStrokePath } from '@/utils/drawing'

interface UserRoleRecord {
  avatar_url?: string
  created_at?: string
  email?: string
  full_name?: string
  isOnline?: boolean
  last_sign_in_at?: string
  requested_clearance?: boolean
  requestedClearance?: boolean
  role: ClearanceLevel
  user_id: string
}

const selectedTab = ref(0)
const tabs = [
  { icon: KeyRound, name: 'roles' },
  { icon: BriefcaseBusiness, name: 'people' },
  { icon: Luggage, name: 'trip' },
  { icon: GalleryHorizontal, name: 'images' },
  { icon: Pencil, name: 'guestbook' },
  { icon: Notebook, name: 'blog' },
  { icon: Feather, name: 'quotes' },
]

const tabQueryKeys: Record<number, string[]> = {
  0: ['admin-user-roles'],
  1: ['admin-work-people'],
  2: ['admin-trips'],
  3: ['admin-images'],
  4: ['admin-guestbook'],
  5: ['admin-blog'],
  6: ['admin-quotes'],
}

const clearanceLevels: ClearanceLevel[] = ['auth', 'known', 'friends', 'close']
const quoteClearanceLevels: ClearanceLevel[] = ['public', 'friends', 'close']

const queryClient = useQueryClient()
const pendingRoles = reactive<Record<string, ClearanceLevel>>({})

// ----------------------------------------------------
// LIVE VISITORS — read the public presence room without tracking ourselves.
// ----------------------------------------------------
useLive()
const liveVisitors = computed(() =>
  [...activePresenceUsers.value].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
)

// ----------------------------------------------------
// PAGE VIEWS — click a user to see their browsing history.
// ----------------------------------------------------
const expandedUserId = ref<null | string>(null)

const toggleUserExpand = (id: string) => {
  expandedUserId.value = expandedUserId.value === id ? null : id
}

interface PageViewRecord {
  last_visited_at?: string
  path: string
  views: number
}

const {
  data: pageViews,
  error: pageViewsError,
  isLoading: pageViewsLoading,
} = useQuery({
  enabled: computed(() => isAdmin.value && !!expandedUserId.value),
  queryFn: async () => {
    const uid = expandedUserId.value
    if (!uid) return []
    const { data, error } = await supabase
      .from('user_page_views')
      .select('path, views, last_visited_at')
      .eq('user_id', uid)
      .order('views', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data || []) as PageViewRecord[]
  },
  queryKey: computed(() => ['admin-user-page-views', expandedUserId.value]),
})

const formatVisited = (iso?: string) => (iso ? format(new Date(iso), 'MMM d · HH:mm') : '—')

// Pull to refresh state & handlers
const pullDistance = ref(0)
const pullThreshold = 60
const isRefreshing = ref(false)

let startY = 0
let isPulling = false

async function handleRefresh() {
  const queryKey = tabQueryKeys[selectedTab.value]
  if (queryKey) {
    await queryClient.invalidateQueries({ queryKey })
  }
  if (expandedUserId.value) {
    await queryClient.invalidateQueries({ queryKey: ['admin-user-page-views'] })
  }
}

async function onTouchEnd() {
  if (!isPulling || isRefreshing.value) return
  isPulling = false

  if (pullDistance.value >= pullThreshold) {
    isRefreshing.value = true
    pullDistance.value = pullThreshold
    await handleRefresh()
    isRefreshing.value = false
  }
  pullDistance.value = 0
}

function onTouchMove(e: TouchEvent) {
  if (!isPulling || isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  const currentY = e.touches[0].clientY
  const diffY = currentY - startY

  if (diffY > 0 && (!target || target.scrollTop <= 0)) {
    pullDistance.value = Math.min(diffY * 0.45, 120)
  } else {
    pullDistance.value = 0
    isPulling = false
  }
}

function onTouchStart(e: TouchEvent) {
  if (isRefreshing.value) return
  const target = e.currentTarget as HTMLElement | null
  if (!target || target.scrollTop <= 0) {
    startY = e.touches[0].clientY
    isPulling = true
  }
}

const { data: userRolesList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    // Admin-guarded RPC (replaces the previously anon-exposed view)
    const { data, error } = await supabase.rpc('admin_user_roles')
    if (error) throw error
    return (data || []) as UserRoleRecord[]
  },
  queryKey: ['admin-user-roles'],
})

const onlineUserIds = computed(() => new Set(liveVisitors.value.map((v) => v.id)))

const sortedUserRolesList = computed(() => {
  return (userRolesList.value || [])
    .filter((u) => u.role !== 'admin')
    .map((u) => ({ ...u, isOnline: onlineUserIds.value.has(u.user_id) }))
    .sort((a, b) => {
      const aRequested = a.role === 'auth' && Boolean(a.requested_clearance ?? a.requestedClearance)
      const bRequested = b.role === 'auth' && Boolean(b.requested_clearance ?? b.requestedClearance)

      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1

      if (aRequested !== bRequested) return aRequested ? -1 : 1

      const nameA = (a.full_name || a.email || '').trim()
      const nameB = (b.full_name || b.email || '').trim()
      const nameComparison = nameA.localeCompare(nameB, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
      if (nameComparison !== 0) return nameComparison

      const timeA = a.created_at ? Date.parse(a.created_at) : 0
      const timeB = b.created_at ? Date.parse(b.created_at) : 0
      return timeB - timeA
    })
})

// Sync pending roles when data loads
watch(
  userRolesList,
  (list) => {
    if (list) {
      list.forEach((u) => {
        if (!pendingRoles[u.user_id]) {
          pendingRoles[u.user_id] = u.role
        }
      })
    }
  },
  { immediate: true },
)

const roleBadgeClasses: Record<ClearanceLevel, string> = {
  admin: 'bg-red-500 dark:bg-red-400',
  auth: 'bg-yellow-500 dark:bg-yellow-400',
  close: 'bg-green-500 dark:bg-green-400',
  friends: 'bg-purple-500 dark:bg-purple-400',
  known: 'bg-blue-500 dark:bg-blue-400',
  public: 'bg-dark',
}

interface PersonForm {
  imageName: string
  linkedin: string
  name: string
  quote: string
}

// ----------------------------------------------------
// PEOPLE TAB
// ----------------------------------------------------
interface WorkPersonRecord {
  imageName: string
  linkedin: null | string
  name: string
  orgId: string
  quote: null | string
}

const editForms = reactive<Record<string, PersonForm>>({})
const savingPersonKey = ref<null | string>(null)

const { data: peopleList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('work_people')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []) as WorkPersonRecord[]
  },
  queryKey: ['admin-work-people'],
})

const orgsWithPeople = computed(() => {
  const people = peopleList.value || []
  const orgMap = new Map<string, { id: string; name: string; people: WorkPersonRecord[] }>()

  workHistory.forEach((w) => {
    if (w.orgId && !orgMap.has(w.orgId)) {
      orgMap.set(w.orgId, { id: w.orgId, name: w.orgName, people: [] })
    }
  })

  people.forEach((p) => {
    if (!orgMap.has(p.orgId)) {
      orgMap.set(p.orgId, { id: p.orgId, name: p.orgId, people: [] })
    }
    orgMap.get(p.orgId)!.people.push(p)
  })

  return Array.from(orgMap.values())
    .filter((org) => org.people.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const isAddPersonModalOpen = ref(false)
const isAddingPerson = ref(false)
const isConvertingImage = ref(false)
const selectedImageFile = ref<File | null>(null)
const imagePreviewUrl = ref<null | string>(null)

async function convertToSquareWebp(file: File, size = 400, quality = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  const minDim = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - minDim) / 2
  const sy = (bitmap.height - minDim) / 2
  ctx.drawImage(bitmap, sx, sy, minDim, minDim, 0, 0, size, size)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas conversion failed'))
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }))
      },
      'image/webp',
      quality,
    )
  })
}

const newPersonForm = reactive({
  linkedin: '',
  name: '',
  orgId: '',
  quote: '',
})

const availableOrgs = computed(() => {
  const map = new Map<string, string>()
  workHistory.forEach((w) => {
    if (w.orgId) map.set(w.orgId, w.orgName)
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})

interface TripForm {
  clearance: ClearanceLevel
  date: string
  descriptionText: string
  instagram_link: string
  maps_list_link: string
  repeat_visit: boolean
  slug: string
  subtitle: string
  title: string
}

// ----------------------------------------------------
// TRIPS TAB
// ----------------------------------------------------
interface TripRecord {
  clearance: ClearanceLevel
  date: string
  description: string[]
  instagram_link: null | string
  maps_list_link: null | string
  repeat_visit: boolean
  slug: string
  subtitle: null | string
  title: string
}

async function addPerson() {
  if (!newPersonForm.orgId || !newPersonForm.name) return

  isAddingPerson.value = true
  try {
    const cleanImageName = selectedImageFile.value
      ? selectedImageFile.value.name.replace(/\.[^/.]+$/, '').trim()
      : newPersonForm.name.toLowerCase().trim().replace(/\s+/g, '-')

    if (selectedImageFile.value) {
      const { error: uploadError } = await supabase.storage
        .from('webp')
        .upload(`${newPersonForm.orgId}/${cleanImageName}.webp`, selectedImageFile.value, {
          contentType: 'image/webp',
          upsert: true,
        })

      if (uploadError) throw uploadError
    }

    const { error } = await supabase.from('work_people').insert({
      imageName: cleanImageName,
      linkedin: newPersonForm.linkedin.trim() || null,
      name: newPersonForm.name.trim(),
      orgId: newPersonForm.orgId,
      quote: newPersonForm.quote.trim() || null,
    })

    if (error) throw error

    await queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
    await queryClient.invalidateQueries({ queryKey: ['work-people'] })

    newPersonForm.name = ''
    newPersonForm.linkedin = ''
    newPersonForm.quote = ''
    selectedImageFile.value = null
    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
      imagePreviewUrl.value = null
    }
    isAddPersonModalOpen.value = false
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to add person: ${errorMsg}`)
  } finally {
    isAddingPerson.value = false
  }
}

async function onImageFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isConvertingImage.value = true
  try {
    const webpFile = await convertToSquareWebp(file)
    selectedImageFile.value = webpFile

    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
    }
    imagePreviewUrl.value = URL.createObjectURL(webpFile)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to convert image: ${errorMsg}`)
    target.value = ''
  } finally {
    isConvertingImage.value = false
  }
}

function openAddPersonModal() {
  if (!newPersonForm.orgId && availableOrgs.value.length > 0) {
    newPersonForm.orgId = availableOrgs.value[0].id
  }
  selectedImageFile.value = null
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = null
  }
  isAddPersonModalOpen.value = true
}

const editTripForms = reactive<Record<string, TripForm>>({})
const savingTripSlug = ref<null | string>(null)

const { data: tripsList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []) as TripRecord[]
  },
  queryKey: ['admin-trips'],
})

// ----------------------------------------------------
// GUESTBOOK TAB
// ----------------------------------------------------
interface GuestbookEntry {
  avatar_url?: string
  created_at?: string
  display_name?: string
  email?: string
  id: string
  strokes: number[][][]
  updated_at?: string
  user_id?: string
}

interface ImageEditForm {
  caption: string
  clearance: ClearanceLevel
}

// ----------------------------------------------------
// IMAGES TAB
// ----------------------------------------------------
interface TripImageRecord {
  caption: null | string
  clearance: ClearanceLevel
  date_taken: null | string
  height: null | number
  id: string
  lat: null | number
  lng: null | number
  sort_order: null | number
  storage_object_id: null | string
  storage_path: string
  trip_slug: string
  width: null | number
}

async function deletePerson(person: WorkPersonRecord) {
  if (!confirm(`Are you sure you want to delete ${person.name}?`)) return

  try {
    const { error } = await supabase
      .from('work_people')
      .delete()
      .eq('orgId', person.orgId)
      .eq('name', person.name)

    if (error) throw error

    delete editForms[getPersonKey(person)]

    await queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
    await queryClient.invalidateQueries({ queryKey: ['work-people'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete person: ${errorMsg}`)
  }
}

async function deleteTrip(slug: string) {
  if (!confirm(`Are you sure you want to delete trip "${slug}"?`)) return

  try {
    const { error } = await supabase.from('trips').delete().eq('slug', slug)
    if (error) throw error

    delete editTripForms[slug]

    await queryClient.invalidateQueries({ queryKey: ['admin-trips'] })
    await queryClient.invalidateQueries({ queryKey: ['trips'] })
    await queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete trip: ${errorMsg}`)
  }
}

function formatTripDate(dateStr?: null | string) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'MMMM yyyy')
  } catch {
    return dateStr
  }
}

function getEditForm(person: WorkPersonRecord): PersonForm {
  const key = getPersonKey(person)
  if (!editForms[key]) {
    editForms[key] = {
      imageName: person.imageName || '',
      linkedin: person.linkedin || '',
      name: person.name || '',
      quote: person.quote || '',
    }
  }
  return editForms[key]
}

function getEditTripForm(trip: TripRecord): TripForm {
  if (!editTripForms[trip.slug]) {
    editTripForms[trip.slug] = {
      clearance: trip.clearance || 'public',
      date: trip.date ? (trip.date.length >= 10 ? trip.date.slice(0, 10) : trip.date) : '',
      descriptionText: (trip.description || []).join('\n'),
      instagram_link: trip.instagram_link || '',
      maps_list_link: trip.maps_list_link || '',
      repeat_visit: !!trip.repeat_visit,
      slug: trip.slug,
      subtitle: trip.subtitle || '',
      title: trip.title || '',
    }
  }
  return editTripForms[trip.slug]
}

function getPersonKey(person: { name: string; orgId: string }) {
  return `${person.orgId}:${person.name}`
}

function getRoleBadgeClass(role: ClearanceLevel) {
  return roleBadgeClasses[role] || roleBadgeClasses.public
}

function getWorkPersonUrl(orgId: string, filename?: string) {
  if (!filename) return ''
  const name = filename.replace(/\.[^/.]+$/, '')
  return getStorageUrl('webp', orgId, `${name}.webp`)
}

function handleSmartApostrophes(e: Event, update: (val: string) => void) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  const original = target.value
  const transformed = original
    // Between letters (e.g. don't, it's, you're, we'll)
    .replace(/(\p{L})'(\p{L})/gu, '$1’$2')
    // Decades & 2-digit years (e.g. '26, '90s, '80)
    .replace(/(^|[\s(["'/{])'(\d{2})/g, '$1’$2')
    // Common leading contractions (e.g. 'tis, 'twas, 'cause, 'em, 'round, 'bout, 'til, 'n)
    .replace(/(^|[\s(["'/{])'(tis|twas|cause|em|round|bout|til|n)\b/gi, '$1’$2')
    // Trailing g-dropping contractions (e.g. rockin', walkin', nothin')
    .replace(/(\p{L})in'\b/gu, '$1in’')

  if (transformed !== original) {
    const start = target.selectionStart
    const end = target.selectionEnd
    target.value = transformed
    update(transformed)
    if (start !== null && end !== null) {
      target.setSelectionRange(start, end)
    }
  } else {
    update(original)
  }
}

function resetPerson(person: WorkPersonRecord) {
  const key = getPersonKey(person)
  editForms[key] = {
    imageName: person.imageName || '',
    linkedin: person.linkedin || '',
    name: person.name || '',
    quote: person.quote || '',
  }
}

function resetTrip(trip: TripRecord) {
  editTripForms[trip.slug] = {
    clearance: trip.clearance || 'public',
    date: trip.date ? (trip.date.length >= 10 ? trip.date.slice(0, 10) : trip.date) : '',
    descriptionText: (trip.description || []).join('\n'),
    instagram_link: trip.instagram_link || '',
    maps_list_link: trip.maps_list_link || '',
    repeat_visit: !!trip.repeat_visit,
    slug: trip.slug,
    subtitle: trip.subtitle || '',
    title: trip.title || '',
  }
}

async function savePerson(person: WorkPersonRecord, close?: () => void) {
  const key = getPersonKey(person)
  const form = getEditForm(person)
  savingPersonKey.value = key

  try {
    const { error } = await supabase
      .from('work_people')
      .update({
        imageName: form.imageName,
        linkedin: form.linkedin || null,
        name: form.name,
        quote: form.quote || null,
      })
      .eq('orgId', person.orgId)
      .eq('name', person.name)

    if (error) throw error

    person.name = form.name
    person.imageName = form.imageName
    person.linkedin = form.linkedin || null
    person.quote = form.quote || null

    if (form.name !== person.name) {
      delete editForms[key]
    }

    await queryClient.invalidateQueries({ queryKey: ['admin-work-people'] })
    await queryClient.invalidateQueries({ queryKey: ['work-people'] })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save person: ${errorMsg}`)
  } finally {
    savingPersonKey.value = null
  }
}

async function saveRole(user: UserRoleRecord) {
  const newRole = pendingRoles[user.user_id]
  if (!newRole) return

  const prevRole = user.role
  user.role = newRole

  try {
    const { error } = await supabase.rpc('admin_set_role', {
      new_role: newRole,
      target_user_id: user.user_id,
    })

    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  } catch (err: unknown) {
    user.role = prevRole
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to update role: ${errorMsg}`)
    await queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] })
  }
}

async function saveTrip(trip: TripRecord, close?: () => void) {
  const form = getEditTripForm(trip)
  savingTripSlug.value = trip.slug

  const descArray = form.descriptionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  try {
    const { error } = await supabase
      .from('trips')
      .update({
        clearance: form.clearance,
        date: form.date,
        description: descArray,
        instagram_link: form.instagram_link || null,
        maps_list_link: form.maps_list_link || null,
        repeat_visit: form.repeat_visit,
        slug: form.slug,
        subtitle: form.subtitle || null,
        title: form.title,
      })
      .eq('slug', trip.slug)

    if (error) throw error

    trip.title = form.title
    trip.subtitle = form.subtitle || null
    trip.slug = form.slug
    trip.date = form.date
    trip.description = descArray
    trip.instagram_link = form.instagram_link || null
    trip.maps_list_link = form.maps_list_link || null
    trip.repeat_visit = form.repeat_visit
    trip.clearance = form.clearance

    if (form.slug !== trip.slug) {
      delete editTripForms[trip.slug]
    }

    await queryClient.invalidateQueries({ queryKey: ['admin-trips'] })
    await queryClient.invalidateQueries({ queryKey: ['trips'] })
    await queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save trip: ${errorMsg}`)
  } finally {
    savingTripSlug.value = null
  }
}

const editImageForms = reactive<Record<string, ImageEditForm>>({})
const savingImageId = ref<null | string>(null)

const { data: adminTripsImagesData } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*, trip_images(*)')
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },
  queryKey: ['admin-images'],
})

const tripsWithImagesGrouped = computed(() => {
  const list = (adminTripsImagesData.value || []) as Array<
    TripRecord & { trip_images?: TripImageRecord[] }
  >
  return list.map((trip) => {
    const images: TripImageRecord[] = sortTripImages(trip.trip_images || [])

    return {
      date: trip.date,
      privateImages: images.filter((img) => img.clearance !== 'public'),
      publicImages: images.filter((img) => img.clearance === 'public'),
      slug: trip.slug,
      subtitle: trip.subtitle,
      title: trip.title,
    }
  })
})

const activeImageTripIndex = ref(0)
const imagesScrollContainer = ref<HTMLElement | null>(null)
let scrollRafId: null | number = null

function onImagesScroll(e: Event) {
  if (scrollRafId !== null) return
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null
    const el = e.target as HTMLElement
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (
      index !== activeImageTripIndex.value &&
      index >= 0 &&
      index < tripsWithImagesGrouped.value.length
    ) {
      activeImageTripIndex.value = index
    }
  })
}

function scrollToTripIndex(index: number) {
  if (!imagesScrollContainer.value) return
  const targetIndex = Math.max(0, Math.min(index, tripsWithImagesGrouped.value.length - 1))
  const containerWidth = imagesScrollContainer.value.clientWidth
  imagesScrollContainer.value.scrollTo({
    behavior: 'smooth',
    left: targetIndex * containerWidth,
  })
}

const currentVisibleTrip = computed(() => {
  const list = tripsWithImagesGrouped.value
  return list[activeImageTripIndex.value] || null
})

async function deleteImage(img: TripImageRecord) {
  if (!confirm('Are you sure you want to delete this image?')) return

  try {
    const { error } = await supabase.from('trip_images').delete().eq('id', img.id)
    if (error) throw error

    if (img.storage_path) {
      await supabase.storage.from('travel').remove([img.storage_path, `thumb/${img.storage_path}`])
    }

    delete editImageForms[img.id]

    await queryClient.invalidateQueries({ queryKey: ['admin-images'] })
    await queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
    await queryClient.invalidateQueries({ queryKey: ['trip-images'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete image: ${errorMsg}`)
  }
}

function formatImageDate(dateStr: null | string | undefined): string {
  if (!dateStr) return 'No date recorded'
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, HH:mm')
  } catch {
    return dateStr
  }
}

function formatImageGps(lat: null | number | undefined, lng: null | number | undefined): string {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return 'No location recorded'
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

function getEditImageForm(img: TripImageRecord): ImageEditForm {
  if (!editImageForms[img.id]) {
    editImageForms[img.id] = {
      caption: img.caption || '',
      clearance: img.clearance,
    }
  }
  return editImageForms[img.id]
}

function getTripThumbnailUrl(storagePath: string) {
  return getStorageUrl('travel', `thumb/${storagePath}`)
}

function resetImage(img: TripImageRecord) {
  editImageForms[img.id] = {
    caption: img.caption || '',
    clearance: img.clearance,
  }
}

async function saveImage(img: TripImageRecord, close?: () => void) {
  const form = getEditImageForm(img)
  savingImageId.value = img.id

  try {
    const isMovingFromPublicToPrivate = img.clearance === 'public' && form.clearance !== 'public'
    const isMovingFromPrivateToPublic = img.clearance !== 'public' && form.clearance === 'public'
    let newStoragePath: null | string = null

    if (isMovingFromPublicToPrivate && !img.storage_path.includes('/pvt/')) {
      const fileName = img.storage_path.split('/').pop() || img.storage_path
      const fromPath = img.storage_path
      const toPath = `${img.trip_slug}/pvt/${fileName}`

      const fromThumbPath = `thumb/${fromPath}`
      const toThumbPath = `thumb/${toPath}`

      // Move full image
      const { error: moveError } = await supabase.storage.from('travel').move(fromPath, toPath)
      if (moveError) throw moveError

      // Move thumbnail image
      const { error: moveThumbError } = await supabase.storage
        .from('travel')
        .move(fromThumbPath, toThumbPath)

      if (moveThumbError) {
        console.warn('Failed to move thumbnail image:', moveThumbError)
      }

      newStoragePath = toPath
    } else if (isMovingFromPrivateToPublic && img.storage_path.includes('/pvt/')) {
      const fileName = img.storage_path.split('/').pop() || img.storage_path
      const fromPath = img.storage_path
      const toPath = `${img.trip_slug}/${fileName}`

      const fromThumbPath = `thumb/${fromPath}`
      const toThumbPath = `thumb/${toPath}`

      // Move full image
      const { error: moveError } = await supabase.storage.from('travel').move(fromPath, toPath)
      if (moveError) throw moveError

      // Move thumbnail image
      const { error: moveThumbError } = await supabase.storage
        .from('travel')
        .move(fromThumbPath, toThumbPath)

      if (moveThumbError) {
        console.warn('Failed to move thumbnail image:', moveThumbError)
      }

      newStoragePath = toPath
    }

    const updatePayload: {
      caption: null | string
      clearance: ClearanceLevel
      storage_path?: string
    } = {
      caption: form.caption.trim() || null,
      clearance: form.clearance,
    }

    if (newStoragePath) {
      updatePayload.storage_path = newStoragePath
    }

    const { error } = await supabase.from('trip_images').update(updatePayload).eq('id', img.id)

    if (error) throw error

    if (newStoragePath) {
      img.storage_path = newStoragePath
    }
    img.caption = form.caption.trim() || null
    img.clearance = form.clearance

    await queryClient.invalidateQueries({ queryKey: ['admin-images'] })
    await queryClient.invalidateQueries({ queryKey: ['trips-with-images'] })
    await queryClient.invalidateQueries({ queryKey: ['trip-images'] })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save image: ${errorMsg}`)
  } finally {
    savingImageId.value = null
  }
}

// ----------------------------------------------------
// GUESTBOOK TAB
// ----------------------------------------------------
const { data: guestbookEntries } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    // Admin-guarded RPC (replaces the previously anon-exposed view)
    const { data, error } = await supabase.rpc('admin_guestbook')
    if (error) throw error
    return ((data || []) as GuestbookEntry[]).sort((a, b) => {
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      return bTime - aTime
    })
  },
  queryKey: ['admin-guestbook'],
})

const parsedGuestbookEntries = computed(() => {
  return (guestbookEntries.value || []).map((entry) => {
    const strokes = parseStrokes(entry.strokes)
    const svgPaths = strokes.map(getSvgPathFromStroke).filter(Boolean)
    const viewBox = getDrawingViewBox(strokes)
    return {
      ...entry,
      svgPaths,
      viewBox,
    }
  })
})

interface BlogForm {
  clearance: ClearanceLevel
  date: string
  excerpt: string
  is_active: boolean
  minutes: null | number
  slug: string
  title: string
}

// ----------------------------------------------------
// BLOG TAB
// ----------------------------------------------------
interface BlogPostRecord {
  clearance: ClearanceLevel
  date: string
  excerpt: null | string
  is_active: boolean
  minutes: null | number
  slug: string
  title: string
}

async function deleteGuestbookEntry(id: string) {
  if (!confirm('Are you sure you want to delete this drawing?')) return

  try {
    const { error } = await supabase.from('guestbook').delete().eq('id', id)
    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['admin-guestbook'] })
    await queryClient.invalidateQueries({ queryKey: ['guestbook', 'latest'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete drawing: ${errorMsg}`)
  }
}

const editBlogForms = reactive<Record<string, BlogForm>>({})
const savingBlogSlug = ref<null | string>(null)

const { data: blogPostsList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []) as BlogPostRecord[]
  },
  queryKey: ['admin-blog'],
})

interface QuoteForm {
  clearance: ClearanceLevel
  content: string
  date: string
  id: string
  title: string
}

// ----------------------------------------------------
// QUOTES
// ----------------------------------------------------
interface QuoteRecord {
  clearance: ClearanceLevel
  content: string
  created_at: string
  date: string
  id: string
  title?: null | string
  updated_at: string
}

// The blog storage layout is `{slug}/{slug}.md` for public posts and
// `pvt/{slug}/{slug}.md` for anything above public (mirrors useBlog.ts).
function blogStoragePath(slug: string, clearance: ClearanceLevel): string {
  const base = `${slug}/${slug}.md`
  return clearance === 'public' ? base : `pvt/${base}`
}

async function deleteBlog(slug: string) {
  if (!confirm(`Are you sure you want to delete blog post "${slug}"?`)) return

  try {
    const { error } = await supabase.from('blog').delete().eq('slug', slug)
    if (error) throw error

    delete editBlogForms[slug]

    await queryClient.invalidateQueries({ queryKey: ['admin-blog'] })
    await queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    await queryClient.invalidateQueries({ queryKey: ['blog-post', slug] })
    await queryClient.invalidateQueries({ queryKey: ['blog-post-content', slug] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete blog post: ${errorMsg}`)
  }
}

function formatBlogDate(dateStr: null | string) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'dd MMMM yyyy')
  } catch {
    return dateStr
  }
}

function getDrawingViewBox(strokes: number[][][]) {
  const b = getStrokeBounds(strokes)
  if (!b) return undefined
  return `${b.minX} ${b.minY} ${b.w} ${b.h}`
}

function getEditBlogForm(post: BlogPostRecord): BlogForm {
  if (!editBlogForms[post.slug]) {
    editBlogForms[post.slug] = {
      clearance: post.clearance || 'public',
      date: post.date ? (post.date.length >= 10 ? post.date.slice(0, 10) : post.date) : '',
      excerpt: post.excerpt || '',
      is_active: !!post.is_active,
      minutes: post.minutes ?? null,
      slug: post.slug,
      title: post.title || '',
    }
  }
  return editBlogForms[post.slug]
}

function getSvgPathFromStroke(points: number[][]) {
  return getStrokePath(points, {
    smoothing: 0.7,
    streamline: 0.3,
    thinning: 0.5,
  })
}

async function hasBlogFile(path: string): Promise<boolean> {
  const parts = path.split('/')
  const folder = parts.slice(0, -1).join('/')
  const filename = parts[parts.length - 1]
  const { data, error } = await supabase.storage.from('blog').list(folder, { limit: 1000 })
  if (error) throw error
  return (data || []).some((o) => o.name === filename)
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

function resetBlog(post: BlogPostRecord) {
  editBlogForms[post.slug] = {
    clearance: post.clearance || 'public',
    date: post.date ? (post.date.length >= 10 ? post.date.slice(0, 10) : post.date) : '',
    excerpt: post.excerpt || '',
    is_active: !!post.is_active,
    minutes: post.minutes ?? null,
    slug: post.slug,
    title: post.title || '',
  }
}

async function saveBlog(post: BlogPostRecord, close?: () => void) {
  const form = getEditBlogForm(post)
  const oldSlug = post.slug
  const newSlug = form.slug.trim()
  const oldClearance = post.clearance
  const newClearance = form.clearance
  savingBlogSlug.value = oldSlug

  if (!newSlug) {
    alert('Slug cannot be empty.')
    savingBlogSlug.value = null
    return
  }

  const oldPath = blogStoragePath(oldSlug, oldClearance)
  const newPath = blogStoragePath(newSlug, newClearance)
  const needsMove = oldPath !== newPath

  try {
    // Guard against slug collisions before touching anything.
    if (newSlug !== oldSlug) {
      const { data: clash, error: clashError } = await supabase
        .from('blog')
        .select('slug')
        .eq('slug', newSlug)
        .maybeSingle()
      if (clashError) throw clashError
      if (clash) throw new Error(`A post with the slug “${newSlug}” already exists.`)
    }

    // Move the markdown file first so a failure leaves the DB untouched.
    if (needsMove) {
      if (!(await hasBlogFile(oldPath))) {
        throw new Error(`Blog file not found at “${oldPath}”.`)
      }
      if (await hasBlogFile(newPath)) {
        throw new Error(`Destination file already exists at “${newPath}”.`)
      }
      const { error: moveError } = await supabase.storage.from('blog').move(oldPath, newPath)
      if (moveError) throw moveError
    }

    // minutes must stay > 0 (DB CHECK); collapse empty/zero back to null.
    const minutes = form.minutes && form.minutes > 0 ? form.minutes : null

    const { error } = await supabase
      .from('blog')
      .update({
        clearance: newClearance,
        date: form.date,
        excerpt: form.excerpt.trim() || null,
        is_active: form.is_active,
        minutes,
        slug: newSlug,
        title: form.title,
      })
      .eq('slug', oldSlug)

    if (error) {
      // Best-effort rollback of the file move.
      if (needsMove) {
        await supabase.storage.from('blog').move(newPath, oldPath)
      }
      throw error
    }

    post.title = form.title
    post.clearance = newClearance
    post.date = form.date
    post.excerpt = form.excerpt.trim() || null
    post.is_active = form.is_active
    post.minutes = minutes
    post.slug = newSlug

    if (newSlug !== oldSlug) {
      delete editBlogForms[oldSlug]
    }

    await queryClient.invalidateQueries({ queryKey: ['admin-blog'] })
    await queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    await queryClient.invalidateQueries({ queryKey: ['blog-post', newSlug] })
    await queryClient.invalidateQueries({ queryKey: ['blog-post-content', newSlug] })
    await queryClient.invalidateQueries({ queryKey: ['blog-post', oldSlug] })
    await queryClient.invalidateQueries({ queryKey: ['blog-post-content', oldSlug] })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save blog post: ${errorMsg}`)
  } finally {
    savingBlogSlug.value = null
  }
}

const editQuoteForms = reactive<Record<string, QuoteForm>>({})
const savingQuoteId = ref<null | string>(null)
const isAddQuoteModalOpen = ref(false)
const isAddingQuote = ref(false)
const newQuoteForm = reactive<{
  clearance: ClearanceLevel
  content: string
  date: string
  title: string
}>({
  clearance: 'public',
  content: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  title: '',
})

const { data: quotesList } = useQuery({
  enabled: computed(() => isAdmin.value),
  queryFn: async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []) as QuoteRecord[]
  },
  queryKey: ['admin-quotes'],
})

async function addQuote() {
  const content = newQuoteForm.content.trim()
  if (!content) return

  isAddingQuote.value = true
  try {
    const { error } = await supabase.from('quotes').insert({
      clearance: newQuoteForm.clearance,
      content,
      date: newQuoteForm.date,
      title: newQuoteForm.title.trim() || null,
    })

    if (error) throw error

    await queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    await queryClient.invalidateQueries({ queryKey: ['quotes'] })

    isAddQuoteModalOpen.value = false
    newQuoteForm.content = ''
    newQuoteForm.title = ''
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to add quote: ${errorMsg}`)
  } finally {
    isAddingQuote.value = false
  }
}

async function deleteQuote(id: string) {
  if (!confirm('Are you sure you want to delete this quote?')) return

  try {
    const { error } = await supabase.from('quotes').delete().eq('id', id)
    if (error) throw error

    delete editQuoteForms[id]

    await queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    await queryClient.invalidateQueries({ queryKey: ['quotes'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to delete quote: ${errorMsg}`)
  }
}

function formatQuoteDate(dateStr: null | string) {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr), 'dd MMMM yyyy')
  } catch {
    return dateStr
  }
}

function getEditQuoteForm(quote: QuoteRecord): QuoteForm {
  if (!editQuoteForms[quote.id]) {
    editQuoteForms[quote.id] = {
      clearance: quote.clearance || 'public',
      content: quote.content || '',
      date: quote.date ? (quote.date.length >= 10 ? quote.date.slice(0, 10) : quote.date) : '',
      id: quote.id,
      title: quote.title || '',
    }
  }
  return editQuoteForms[quote.id]
}

function openAddQuoteModal() {
  newQuoteForm.clearance = 'public'
  newQuoteForm.content = ''
  newQuoteForm.date = format(new Date(), 'yyyy-MM-dd')
  newQuoteForm.title = ''
  isAddQuoteModalOpen.value = true
}

function resetQuote(quote: QuoteRecord) {
  editQuoteForms[quote.id] = {
    clearance: quote.clearance || 'public',
    content: quote.content || '',
    date: quote.date ? (quote.date.length >= 10 ? quote.date.slice(0, 10) : quote.date) : '',
    id: quote.id,
    title: quote.title || '',
  }
}

async function saveQuote(quote: QuoteRecord, close?: () => void) {
  const form = getEditQuoteForm(quote)
  const trimmedContent = form.content.trim()
  if (!trimmedContent) {
    alert('Quote content cannot be empty.')
    return
  }

  const trimmedTitle = form.title.trim() || null

  savingQuoteId.value = quote.id
  try {
    const { error } = await supabase
      .from('quotes')
      .update({
        clearance: form.clearance,
        content: trimmedContent,
        date: form.date,
        title: trimmedTitle,
      })
      .eq('id', quote.id)

    if (error) throw error

    quote.content = trimmedContent
    quote.clearance = form.clearance
    quote.date = form.date
    quote.title = trimmedTitle

    await queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    await queryClient.invalidateQueries({ queryKey: ['quotes'] })

    close?.()
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to save quote: ${errorMsg}`)
  } finally {
    savingQuoteId.value = null
  }
}

async function saveQuoteClearance(quote: QuoteRecord) {
  const form = getEditQuoteForm(quote)
  try {
    const { error } = await supabase
      .from('quotes')
      .update({
        clearance: form.clearance,
      })
      .eq('id', quote.id)

    if (error) throw error

    quote.clearance = form.clearance

    await queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    await queryClient.invalidateQueries({ queryKey: ['quotes'] })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    alert(`Failed to update quote clearance: ${errorMsg}`)
  }
}
</script>

<style scoped>
@reference "@/style.css";

.drawing-board {
  @apply border-border-primary relative size-full overflow-hidden rounded-lg border;
  background: url('@/assets/patterns/dot_grid.webp');
  background-size: 2.5%;
  @apply bg-repeat;
}

.dark .drawing-board {
  background: url('@/assets/patterns/dot_grid_dark.webp');
  background-size: 2.5%;
}

.canvas {
  @apply absolute inset-0 size-full cursor-crosshair touch-none;
}

.keyboard-key {
  @apply bg-surface-primary border-border-high-contrast rounded-special text-text-primary flex h-8 w-8.5 items-center justify-center border;
  box-shadow: 0 4px 0 0 var(--color-border-high-contrast);
}
</style>
