import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import store from "@/store";
import LoggerFactory from "@/logger/LoggerFactory";
import CookieUtil from "@/utils/CookieUtil";
import EncryptionUtil from "@/utils/EncryptionUtil";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/game",
    name: "Game",
    component: () =>
      import(/* webpackChunkName: "gameview" */ "../views/GameView.vue"),
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
    path: "/editor/monsters",
    name: "MonsterIndexEditor",
    component: () =>
      import(
        /* webpackChunkName: "editor-monsters" */ "../views/MonsterIndexEditorView.vue"
      ),
  },
  {
    path: "/monsters/comparator",
    name: "MonsterIndexStatComparator",
    component: () =>
      import(
        /* webpackChunkName: "comparator" */ "../views/MonsterIndexStatComparatorView.vue"
      ),
  },
  {
    path: "/editor/abilities",
    name: "AbilitiesEditor",
    component: () =>
      import(
        /* webpackChunkName: "editor-abilities" */ "../views/AbilitiesEditorView.vue"
      ),
  },
  {
    path: "/editor/maps",
    name: "MapGeneratorView",
    component: () =>
      import(
        /* webpackChunkName: "editor-map" */ "../views/MapGeneratorView.vue"
      ),
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  const logger = LoggerFactory.getLogger("Router");
  const secret = CookieUtil.getValue("secret");
  const authorized = secret === process.env.VUE_APP_SECRET;
  if (!authorized && to.name !== "Home") {
    logger.debug(
      `Navition from ${from.fullPath} to ${to.fullPath} not allowed`
    );
    next("/");
  } else {
    const isGameView = to.name === "Game";
    store.commit("setGameMode", isGameView);

    logger.info(
      `Navigating from ${from.fullPath} to ${to.fullPath}. GameMode: ${isGameView}`
    );
    next();
  }
});

export default router;
