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
      path: "/verify",
      name: "Verify",
      component: () => import("../pages/Corners.vue"),
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
