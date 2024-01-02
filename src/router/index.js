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
    {
      path: "/gaming",
      component: () => import("../pages/Blog.vue"),
      children: [
        {
          path: "",
          name: "Gaming",
          component: () => import("../views/Gaming.vue"),
        },
      ],
    },
    {
      path: "/backpacking",
      component: () => import("../pages/Blog.vue"),
      children: [
        {
          path: "",
          name: "Backpacking",
          component: () => import("../views/Travel.vue"),
        },
      ],
    },
    {
      path: "/:catchAll(.*)",
      component: () => import("../404.vue"),
    },
  ],
});

export default router;
