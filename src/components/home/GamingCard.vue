<script setup>
import Description from "./CardDescription.vue";
</script>

<template>
  <div class="card group/gaming aspect-square">
    <div class="relative inset-0 -mt-4 h-full w-full">
      <svg
        class="absolute inset-0 m-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        width="90"
        height="77"
        fill="none"
      >
        <path
          fill="#fff"
          fill-rule="evenodd"
          d="M0 77h13.1V64.2h25.5V58H45V38.4h-6.4V32H0v45Zm13.1-38.3v18.8H32V38.7H13Z"
          clip-rule="evenodd"
        />
        <path
          fill="#fff"
          d="M89.6 77H51v-6.8h12.8v-25h-6.4v-6.8h6.4V32h13v38.3h12.8V77Z"
        />
        <path
          class="group-hover/gaming:animate-bounce"
          fill="#2563EB"
          d="M70.5.1h-45V7h6.4v6.3h6.4v6.4h6.3V26h6.8v-6.4h6.4v-6.4H64V7h6.4V0Z"
        />
      </svg>
    </div>
    <Description
      title="Gaming"
      description="It's my only hobby that has withstood the test of time. The P1 design is also my first tattoo."
      icon="gaming"
    />
  </div>
</template>
