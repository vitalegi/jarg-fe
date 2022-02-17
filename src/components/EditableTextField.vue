<template>
  <v-text-field
    :label="label"
    dense
    v-model="model"
    @change="change"
    @keyup="keyup"
    :disabled="disabled"
  ></v-text-field>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EditableTextField",
  props: {
    label: String,
    value: String,
    disabled: { type: Boolean, default: false },
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
  watch: {
    value(v) {
      this.model = v;
    },
  },
});
</script>

<style scoped lang="scss"></style>
