import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("../views/Home.vue"),
    },
    {
      path: "/design",
      component: () => import("../pages/Blog.vue"),
      children: [
        {
          path: "",
          name: "Design - Quizizz",
          component: () => import("../views/Design.vue"),
        },
      ],
    },
    {
      path: "/now",
      component: () => import("../pages/Blog.vue"),
      children: [
        {
          path: "",
          name: "Now",
          component: () => import("../views/Now.vue"),
        },
      ],
    },
  ],
});

export default router;
