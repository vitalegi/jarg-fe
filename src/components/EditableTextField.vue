<template>
  <v-text-field
    :label="label"
    dense
    v-model="model"
    @change="change"
    @keyup="keyup"
  ></v-text-field>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EditableTextField",
  props: {
    label: String,
    value: String,
  },
  data: () => ({
    model: "",
  }),
  computed: {},
  methods: {
    change(): void {
      this.$emit("change", this.model);
    },
    keyup(): void {
      this.$emit("partialChange", this.model);
    },
  },
  mounted() {
    this.model = this.value;
  },
});
</script>

<style scoped lang="scss"></style>
