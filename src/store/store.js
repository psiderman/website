import { defineStore } from "pinia";
import { ref } from "vue";

export const useStore = defineStore("store", () => {
  const localStore = JSON.parse(localStorage.getItem("store")) || {};
  const cutCorners = ref(localStore.cutCorners || false);
  return { cutCorners };
});
