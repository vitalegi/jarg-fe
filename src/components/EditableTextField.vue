<template>
  <v-text-field
    :label="label"
    dense
    v-model="model"
    @change="change()"
  ></v-text-field>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EditableTextField",
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
});
</script>

<style scoped lang="scss"></style>
