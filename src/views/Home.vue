<template>
  <game-engine />
</template>

<script lang="ts">
import Vue from "vue";
import GameEngine from "../components/GameEngine.vue";

export default Vue.extend({
  name: "Home",

  components: {
    GameEngine,
  },
});
</script>
