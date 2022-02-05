<template>
  <v-card>
    <v-card-title>Player Spawning Area</v-card-title>
    <v-radio-group v-model="mode" row @change="changeSpawningMode">
      <v-radio
        :label="`${playerSpawning1.x} ${playerSpawning1.y}`"
        :value="label1"
      />
      <v-radio
        :label="`${playerSpawning2.x} ${playerSpawning2.y}`"
        :value="label2"
      />
    </v-radio-group>
  </v-card>
</template>

<script lang="ts">
import LoggerFactory from "@/logger/LoggerFactory";
import Vue from "vue";
import Point from "@/models/Point";

export default Vue.extend({
  name: "PlayerSpawnEditor",
  components: {},
  props: {
    playerSpawning1: Point,
    playerSpawning2: Point,
    label1: String,
    label2: String,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.PlayerSpawnEditor"),
    mode: "",
  }),
  computed: {},
  methods: {
    changeSpawningMode(value: string): void {
      this.$emit("change", value);
    },
  },
});
</script>
