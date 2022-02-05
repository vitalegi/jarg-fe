<template>
  <div>
    <MapsEditor />
    <MapEditor />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import MapEditor from "@/editors/map/MapEditor.vue";
import MapsEditor from "@/editors/map/MapsEditor.vue";

export default Vue.extend({
  name: "MapGeneratorView",

  components: {
    MapsEditor,
    MapEditor,
  },
});
</script>
