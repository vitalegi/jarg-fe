<template>
  <v-text-field dense v-model="model" @change="change()"></v-text-field>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EditableIntegerField",
  props: ["value"],
  data: () => ({
    model: "",
  }),
  computed: {},
  methods: {
    change(): void {
      const value = parseInt(this.model, 10);
      this.$emit("change", value);
    },
  },
  mounted() {
    this.model = this.value;
  },
});
</script>

<style scoped lang="scss"></style>
