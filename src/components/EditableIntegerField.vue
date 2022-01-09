<template>
  <v-text-field
    :label="label"
    dense
    v-model="model"
    @change="change"
    :disabled="disabled"
  ></v-text-field>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EditableIntegerField",
  props: {
    label: { type: String },
    value: { type: Number },
    disabled: { type: Boolean, default: false },
  },
  data: () => ({
    model: "0",
  }),
  computed: {},
  methods: {
    change(value: string): void {
      const number = parseInt(value, 10);
      this.$emit("change", number);
    },
  },
  mounted() {
    this.model = `${this.value}`;
  },
});
</script>

<style scoped lang="scss"></style>
