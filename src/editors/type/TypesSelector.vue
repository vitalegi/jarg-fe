<template>
  <ComboBoxInput
    :allValues="getValues()"
    :chips="true"
    :label="label"
    :multiple="true"
    :values="values"
    @change="update"
  />
</template>

<script lang="ts">
import ComboBoxInput from "@/components/ComboBoxInput.vue";
import TypeService from "@/game-engine/type/TypeService";
import Container from "typedi";
import Vue from "vue";

export default Vue.extend({
  name: "TypesSelector",
  components: { ComboBoxInput },
  props: ["label", "values"],
  data: () => ({
    typeService: Container.get<TypeService>(TypeService),
  }),
  computed: {},
  methods: {
    update(values: string[]): void {
      this.$emit("change", values);
    },
    getValues(): string[] {
      return this.typeService.getTypes();
    },
  },
});
</script>
