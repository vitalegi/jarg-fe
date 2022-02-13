<template>
  <div></div>
</template>

<script lang="ts">
import Vue from "vue";
import GameApp from "@/game-engine/GameApp";
import Container from "typedi";
import HomePhase from "@/game-engine/game-phase/HomePhase";

export default Vue.extend({
  name: "GameEngine",

  data: () => ({
    gameApp: Container.get(GameApp),
    homePhase: Container.get(HomePhase),
  }),
  methods: {},
  async mounted() {
    this.gameApp.init();
    await this.homePhase.start(null);
    this.$el.appendChild(this.gameApp.getApp().view);
  },
});
</script>
