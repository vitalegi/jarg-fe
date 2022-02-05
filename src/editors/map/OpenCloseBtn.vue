<template>
  <v-btn icon @click="change">
    <v-icon v-if="open">mdi-arrow-up-drop-circle-outline</v-icon>
    <v-icon v-else>mdi-arrow-down-drop-circle-outline</v-icon>
  </v-btn>
</template>

<script lang="ts">
import LoggerFactory from "@/logger/LoggerFactory";
import Vue from "vue";

export default Vue.extend({
  name: "OpenCloseBtn",
  components: {},
  props: { open: Boolean },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.OpenCloseBtn"),
  }),
  methods: {
    change(value: boolean): void {
      this.$emit("change", value);
    },
  },
});
</script>
