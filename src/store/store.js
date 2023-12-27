import { ref } from "vue";
import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
  const localStore = JSON.parse(localStorage.getItem("store")) || {};

  const lastLogin = ref(localStore.lastLogin || new Date());

  return {
    lastLogin,
  };
});
