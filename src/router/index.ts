import PlacesView from "@/views/PlacesView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: PlacesView,
      props: {
        localStorageKey: "pixel",
      },
    },
  ],
});

export default router;
