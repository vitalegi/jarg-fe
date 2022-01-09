<template>
  <v-combobox
    v-model="select"
    :items="possibleValues"
    :label="label"
    multiple
    chips
    dense
    @change="update"
  />
</template>

<script lang="ts">
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";
import TypeService from "@/game-engine/types/TypeService";
import Container from "typedi";
import Vue from "vue";

export default Vue.extend({
  name: "TypesSelector",
  components: {},
  props: ["label", "values"],
  data: () => ({
    typeService: Container.get<TypeService>(TypeService),
    gameAppDataLoader: Container.get<GameAppDataLoader>(GameAppDataLoader),
    select: new Array<string>(),
    possibleValues: new Array<string>(),
  }),
  computed: {},
  methods: {
    update(values: string[]): void {
      this.$emit("change", values);
    },
  },
  async mounted() {
    await this.gameAppDataLoader.loadTypes();
    this.possibleValues.push(...this.typeService.getTypes());
    if (this.select.length > 0) {
      this.select.splice(0, this.select.length);
    }
    this.select.push(...this.values.map((v: any) => v));
  },
});
</script>
