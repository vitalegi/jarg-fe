<template>
  <v-switch :label="label" dense v-model="model" @change="change()" />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "SwitchInput",
  props: ["label", "value"],
  data: () => ({
    model: "",
  }),
  computed: {},
  methods: {
    change(): void {
      this.$emit("change", this.model);
    },
  },
  mounted() {
    this.model = this.value;
  },
  watch: {
    value(v) {
      this.model = v;
    },
  },
});
</script>

<style scoped lang="scss"></style>
