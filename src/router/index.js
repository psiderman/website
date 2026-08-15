import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: () => import("../views/Home.vue"),
      name: "Home",
      path: "/",
    },
    {
      component: () => import("../pages/Corners.vue"),
      name: "Verify",
      path: "/verify",
    },
    {
      component: () => import("../pages/Design.vue"),
      path: "/design",
    },
    {
      children: [
        {
          component: () => import("../views/Quizizz.vue"),
          name: "Design - Quizizz",
          path: "",
        },
      ],
      component: () => import("../pages/Blog.vue"),
      path: "/design/quizizz",
    },
    {
      children: [
        {
          component: () => import("../views/Dezerv.vue"),
          name: "Design - Dezerv",
          path: "",
        },
      ],
      component: () => import("../pages/Blog.vue"),
      path: "/design/dezerv",
    },
    {
      children: [
        {
          component: () => import("../views/Now.vue"),
          name: "Now",
          path: "",
        },
      ],
      component: () => import("../pages/Blog.vue"),
      path: "/now",
    },
    {
      children: [
        {
          component: () => import("../views/Gaming.vue"),
          name: "Gaming",
          path: "",
        },
      ],
      component: () => import("../pages/Blog.vue"),
      path: "/gaming",
    },
    {
      children: [
        {
          component: () => import("../views/Backpacking.vue"),
          name: "Backpacking",
          path: "",
        },
      ],
      component: () => import("../pages/Blog.vue"),
      path: "/backpacking",
    },
    {
      component: () => import("../404.vue"),
      path: "/:catchAll(.*)",
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  let cut = false;

  try {
    const store = JSON.parse(localStorage.getItem("store"));
    if (typeof store.cutCorners == "boolean") {
      cut = store.cutCorners;
    }
  } catch (error) {
    console.error(error);
  }
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
    window.innerWidth < 1024;

  if (to.path != "/verify" && !cut && isMobile)
    next({ path: "/verify", query: { p: to.path } });
  else next();
});

export default router;
