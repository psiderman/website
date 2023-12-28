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
  ],
});

export default router;
