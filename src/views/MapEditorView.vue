<template>
  <div>
    <MapEditor />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import MapEditor from "@/editors/map/MapEditor.vue";

export default Vue.extend({
  name: "MapGeneratorView",

  components: {
    MapEditor,
  },
});
</script>
