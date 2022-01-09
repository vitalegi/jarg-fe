<template>
  <v-radio-group :label="label" v-model="model" row dense @change="change()">
    <v-radio
      v-for="item in values"
      :key="item.key"
      :label="item.label"
      :value="item.key"
      @change="change"
    ></v-radio>
  </v-radio-group>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "StatSelector",
  props: ["label", "value", "values"],
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
});
</script>

<style scoped lang="scss"></style>
