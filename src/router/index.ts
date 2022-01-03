import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import store from "@/store";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/monsters/editor",
    name: "MonsterIndexEditor",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "../views/MonsterIndexEditorView.vue"
      ),
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  const isGameView = to.name === "Home";
  store.commit("setGameMode", isGameView);
  console.log(
    `Navigating from ${from.fullPath} to ${to.fullPath}. GameMode: ${isGameView}`
  );
  next();
});

export default router;
