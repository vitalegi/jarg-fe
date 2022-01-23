<template>
  <RectangleRandomMapGenerator />
</template>

<script lang="ts">
import Vue from "vue";
import RectangleRandomMapGenerator from "@/editors/map/RectangleRandomMapGenerator.vue";

export default Vue.extend({
  name: "MapGeneratorView",

  components: {
    RectangleRandomMapGenerator,
  },
});
</script>
