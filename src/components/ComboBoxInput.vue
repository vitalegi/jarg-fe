<template>
  <v-combobox
    v-model="select"
    :items="allValues"
    :label="label"
    :multiple="multiple"
    :chips="chips"
    dense
    @change="update"
  />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ComboBoxInput",
  components: {},
  props: ["label", "values", "allValues", "multiple", "chips"],
  data: () => ({
    select: new Array<string>(),
  }),
  computed: {},
  methods: {
    update(values: string[]): void {
      this.$emit("change", values);
    },
  },
  async mounted() {
    if (this.select.length > 0) {
      this.select.splice(0, this.select.length);
    }
    this.select.push(...this.values.map((v: any) => v));
  },
});
</script>
