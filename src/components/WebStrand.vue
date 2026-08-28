<template>
  <div class="inline-flex items-center justify-center" aria-hidden="true">
    <svg
      :width="width"
      :height="height"
      viewBox="0 0 160 322"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="overflow-visible"
    >
      <!-- Horizontal curve 1 (top/innermost) -->
      <path
        :d="currentPath1"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Horizontal curve 2 (middle) -->
      <path
        :d="currentPath2"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Horizontal curve 3 (bottom/outermost) -->
      <path
        :d="currentPath3"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Rib: right outer -->
      <path
        :d="currentPath4"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Rib: right inner -->
      <path
        :d="currentPath5"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Rib: left inner -->
      <path
        :d="currentPath6"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Rib: left outer -->
      <path
        :d="currentPath7"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <!-- Vertical stem / trunk -->
      <path
        :d="currentPath8"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { createTimeline } from 'animejs'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    active?: boolean
    alternate?: boolean
    autoplay?: boolean
    downDuration?: number
    duration?: number
    frame4Delay?: number
    height?: number | string
    loop?: boolean
    strokeColor?: string
    strokeWidth?: number | string
    upDuration?: number
    width?: number | string
  }>(),
  {
    active: undefined,
    alternate: false,
    autoplay: false,
    downDuration: undefined,
    duration: 1800,
    frame4Delay: 400,
    height: 322,
    loop: false,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    upDuration: undefined,
    width: 160,
  },
)

// 8 Paths across 5 Frames (Centered in 160x322)
const P1 = [
  // Frame 1
  [
    75.2868, 303.978, 75.8952, 304.345, 76.1561, 304.304, 76.6561, 303.937, 77.2394, 304.12,
    77.2394, 304.129, 77.806, 303.937, 78.006, 304.095, 78.6374, 303.966, 78.6374, 303.966,
  ],
  // Frame 2
  [
    73.7783, 32.0648, 74.2072, 32.4937, 75.3652, 32.1935, 75.6473, 31.4856, 77, 32.5003, 78.6093,
    32.3462, 80, 31.5005, 80.8337, 32.7511, 83.0211, 32.215, 83.0211, 32.215,
  ],
  // Frame 3
  [
    70.0261, 18.2283, 72.0261, 18.2283, 73.7174, 17.5001, 74.7174, 16.0002, 77.2174, 18.0002,
    80.1241, 17.5771, 83.1241, 16.077, 85.1241, 19.077, 88.5, 19.0002, 88.5, 19.0002,
  ],
  // Frame 4
  [
    69.3025, 34.5176, 71.3025, 34.5176, 73.7174, 33.0001, 74.7174, 31.5002, 77.2174, 33.5002,
    80.1241, 33.0771, 83.1241, 31.5771, 85.1241, 34.5771, 88.5, 34.5003, 88.5, 34.5003,
  ],
  // Frame 5
  [
    63.0999, 41.1449, 68, 50.0003, 71.7788, 45.4038, 72.5049, 39.5038, 78, 52.0003, 82.5, 46.5003,
    86.4545, 39.5669, 86.4545, 53.0003, 95.6701, 40.7031, 95.6701, 40.7031,
  ],
]

const P2 = [
  // Frame 1
  [
    73.4767, 291.187, 73.9767, 291.515, 74.9806, 291.66, 75.593, 291.074, 76.3928, 291.577, 77.2235,
    291.587, 77.7786, 291.172, 78.1581, 291.702, 78.6824, 291.619, 79.7177, 291.239,
  ],
  // Frame 2
  [
    69.4992, 22.0215, 71.7419, 22.651, 73.237, 21.9822, 74.26, 20.6443, 76.5, 22.0003, 79, 21.5003,
    81.3422, 20.8412, 82.916, 22.6904, 85.7489, 22.4543, 86.9686, 21.392,
  ],
  // Frame 3
  [
    60.9244, 11.6226, 64.9244, 12.6226, 68.7311, 11.9516, 72.2311, 9.95152, 76.5121, 13.065,
    81.5714, 12.157, 87.5389, 9.04345, 92.3388, 13.3245, 99.6035, 13.7137, 105.83, 11.638,
  ],
  // Frame 4
  [
    61.0167, 23.3242, 65.0167, 24.3242, 68.3638, 22.2802, 71.8638, 20.2802, 77.3638, 23.7802,
    80.8822, 23.0856, 86.8822, 21.0856, 89.8822, 25.0856, 91.6928, 25.2553, 96.6583, 24.6691,
  ],
  // Frame 5
  [
    56.7878, 26.5641, 65, 36.0003, 69, 35.5003, 70.3946, 23.6602, 76.5, 34.5003, 82, 35.0003,
    88.9162, 24.2286, 92, 34.0003, 95.5, 34.5003, 101.73, 27.6371,
  ],
]

const P3 = [
  // Frame 1
  [
    70.7501, 281.012, 71.2133, 281.18, 74.27, 282.18, 74.7763, 280.62, 75.7791, 280.961, 77.1678,
    280.98, 77.9567, 280.62, 78.8508, 281.233, 79.6789, 281.474, 81.1834, 280.708,
  ],
  // Frame 2
  [
    64.0654, 10.4731, 70, 11.5003, 70.5, 11.5003, 73.174, 8.54097, 75.5, 10.0003, 79.5, 10.0003,
    82.6967, 8.26492, 85.5, 11.5003, 89, 11.0003, 91.6674, 9.30002,
  ],
  // Frame 3
  [
    39.9729, 4.38956, 57.4861, 6.72473, 62.1124, 7.3571, 69.2987, 5.00525, 76.1229, 6.8382, 84.0766,
    6.25836, 92.5766, 3.75836, 102.457, 8.26521, 115.708, 7.4954, 122.776, 6.55495,
  ],
  // Frame 4
  [
    53, 14, 60, 13.5, 62.3974, 12.1581, 68.3974, 8.65807, 77.3974, 11.158, 83.3204, 11.1554,
    91.8204, 8.65541, 96.3204, 13.1554, 99.421, 13.8233, 105.721, 14.7233,
  ],
  // Frame 5
  [
    50.6187, 14.7437, 63.4643, 22.771, 65.9753, 20.1205, 68.5305, 10.6914, 77.4842, 19.423, 84.1105,
    20.1205, 91.7915, 12.4743, 96.3168, 21.3063, 102.5, 18.0002, 108.812, 14.9059,
  ],
]

const P4 = [
  // Frame 1
  [78.0039, 319.989, 78.4637, 299.603, 79.6526, 289.042, 82.3802, 273.166],
  // Frame 2
  [78.0039, 47.9886, 84.1098, 28.298, 87, 20.0003, 95, 1.00027],
  // Frame 3
  [78, 28.5002, 91, 11.5002, 119, 8.1009, 145.5, 1.00025],
  // Frame 4
  [78, 48.0003, 91, 31.0003, 101.5, 17.5003, 120, 1.00027],
  // Frame 5
  [78.1072, 87.053, 87.8051, 60.8503, 101.5, 17.5003, 120, 1.00027],
]

const P5 = [
  // Frame 1
  [78, 320, 77.639, 296.805, 77.639, 279.905, 78.5, 273],
  // Frame 2
  [78, 48.0002, 81, 23.0003, 82.5, 8.50027, 84, 1.00027],
  // Frame 3
  [78.0039, 28.0002, 81, 17.0002, 85, 11.5002, 95, 1.00025],
  // Frame 4
  [78.0039, 47.9885, 84.1098, 28.298, 87, 20.0003, 95, 1.00027],
  // Frame 5
  [78.1111, 87.0413, 84.217, 67.3507, 87.0003, 20.0003, 95.0003, 1.00027],
]

const P6 = [
  // Frame 1
  [77.9961, 320, 75.5, 291.5, 75, 281.5, 74, 273],
  // Frame 2
  [77.9961, 48.0003, 75, 27.5003, 74, 20.0003, 72.5, 1.00027],
  // Frame 3
  [77.9961, 28.0002, 75.5, 17.0002, 72.5, 8.50025, 66, 1.00025],
  // Frame 4
  [77.9961, 48.0003, 74.349, 28.412, 72, 20.0003, 66, 1.00027],
  // Frame 5
  [78.1033, 87.053, 74.4562, 67.4648, 72, 20.0003, 66, 1.00027],
]

const P7 = [
  // Frame 1
  [68.1129, 272.887, 76.6129, 297.387, 73, 295.5, 78, 320],
  // Frame 2
  [60.5, 1.00027, 69, 25.5003, 73, 23.5003, 78, 48.0001],
  // Frame 3
  [16, 1.00032, 48.5, 4.50032, 65.784, 8.60637, 78, 28.5003],
  // Frame 4
  [40, 1.00027, 57, 17.0003, 65.784, 28.1063, 78, 48.0003],
  // Frame 5
  [40, 1.00027, 57, 17.0003, 70.9155, 60.8503, 78.1072, 87.053],
]

const P8 = [
  // Frame 1
  [78, 319.5, 78, 319.5, 78, 320, 78, 320],
  // Frame 2
  [78, 47.5003, 87.5, 137, 69, 234, 78, 321],
  // Frame 3
  [78, 28.0002, 66, 118, 87, 234.5, 78, 321],
  // Frame 4
  [78, 47.5003, 87.5, 137, 69, 234, 78, 321],
  // Frame 5
  [78.1072, 86.553, 78.1072, 181, 78, 238.5, 78, 321.001],
]

// Progress ranges from 0 (Frame 1) to 4 (Frame 5)
const progress = ref(0)
let tl: null | ReturnType<typeof createTimeline> = null

function formatC1(pts: number[]): string {
  const p = pts.map((n) => n.toFixed(2))
  return `M ${p[0]} ${p[1]} C ${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}`
}

function formatC3(pts: number[]): string {
  const p = pts.map((n) => n.toFixed(2))
  return `M ${p[0]} ${p[1]} C ${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]} C ${p[8]} ${p[9]} ${p[10]} ${p[11]} ${p[12]} ${p[13]} C ${p[14]} ${p[15]} ${p[16]} ${p[17]} ${p[18]} ${p[19]}`
}

function interpolateArray(frames: number[][], t: number): number[] {
  const clampedT = Math.max(0, Math.min(frames.length - 1, t))
  const idx = Math.min(Math.floor(clampedT), frames.length - 2)
  const ratio = clampedT - idx
  const from = frames[idx]
  const to = frames[idx + 1]
  return from.map((val, i) => val + (to[i] - val) * ratio)
}

const currentPath1 = computed(() => formatC3(interpolateArray(P1, progress.value)))
const currentPath2 = computed(() => formatC3(interpolateArray(P2, progress.value)))
const currentPath3 = computed(() => formatC3(interpolateArray(P3, progress.value)))
const currentPath4 = computed(() => formatC1(interpolateArray(P4, progress.value)))
const currentPath5 = computed(() => formatC1(interpolateArray(P5, progress.value)))
const currentPath6 = computed(() => formatC1(interpolateArray(P6, progress.value)))
const currentPath7 = computed(() => formatC1(interpolateArray(P7, progress.value)))
const currentPath8 = computed(() => formatC1(interpolateArray(P8, progress.value)))

function pause() {
  if (tl) tl.pause()
}

function play() {
  if (tl) tl.play()
}

function start() {
  if (tl) tl.pause()
  progress.value = 0
  const track = { val: 0 }

  const upDur = props.upDuration ?? props.duration * 0.75
  const downDur = props.downDuration ?? props.duration * 0.25

  tl = createTimeline({
    alternate: props.alternate,
    autoplay: true,
    loop: props.loop,
  })

  // Frame 1 -> 4 (progress 0 to 3)
  tl.add(track, {
    duration: upDur,
    ease: 'inOutSine',
    onUpdate: () => {
      progress.value = track.val
    },
    val: [0, 3],
  })

  // Frame 4 -> 5 (progress 3 to 4) after delay
  tl.add(
    track,
    {
      duration: downDur,
      ease: 'inOutSine',
      onUpdate: () => {
        progress.value = track.val
      },
      val: [3, 4],
    },
    `+=${props.frame4Delay}`,
  )
}

watch(
  () => props.active,
  (val) => {
    if (val) {
      start()
    } else {
      pause()
      progress.value = 0
    }
  },
)

onMounted(() => {
  if (props.active || (props.active === undefined && props.autoplay)) {
    start()
  }
})

onUnmounted(() => {
  if (tl) tl.pause()
})

defineExpose({
  pause,
  play,
  progress,
  start,
})
</script>
