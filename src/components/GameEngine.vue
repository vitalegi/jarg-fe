<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12"> This is {{ name }}! </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import GameService from "@/services/GameService";
import Container from "typedi";
import { InteractionEvent } from "pixi.js";

export default Vue.extend({
  name: "GameEngine",

  data: () => ({
    name: "JaRG",
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
