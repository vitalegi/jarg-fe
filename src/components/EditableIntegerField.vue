<template>
  <v-text-field
    :label="label"
    dense
    v-model="model"
    @change="change"
    :disabled="disabled"
    :persistent-hint="persistentHint"
  ></v-text-field>
</template>

<script lang="ts">
import NumberUtil from "@/utils/NumberUtil";
import Vue from "vue";

export default Vue.extend({
  name: "EditableIntegerField",
  props: {
    label: { type: String },
    value: { type: Number },
    disabled: { type: Boolean, default: false },
    persistentHint: { type: Boolean, default: true },
  },
  data: () => ({
    model: "0",
  }),
  computed: {},
  methods: {
    change(value: string): void {
      const number = NumberUtil.parseAsInt(value);
      if (Number.isNaN(number)) {
        return;
      }
      this.$emit("change", number);
    },
  },
  mounted() {
    this.model = `${this.value}`;
  },
  watch: {
    value(v) {
      this.model = v;
    },
  },
});
</script>

<style scoped lang="scss"></style>
