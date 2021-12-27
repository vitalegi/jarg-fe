<template>
  <div></div>
</template>

<script lang="ts">
import Vue from "vue";
import GameService from "@/services/GameService";
import Container from "typedi";

export default Vue.extend({
  name: "GameEngine",

  data: () => ({
    gameService: Container.get<GameService>(GameService),
  }),
  methods: {},
  async mounted() {
    this.gameService.init().then(() => {
      this.$el.appendChild(this.gameService.getApp().view);
    });
  },
});
</script>
