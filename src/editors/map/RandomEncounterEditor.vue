<template>
  <v-container dense>
    <v-row>
      <v-col cols="12">
        <SelectMonsterIndex
          label="Monster"
          :initialValueId="encounter.monsterId"
          @change="changeMonster"
          @reset="() => changeMonster(null)"
          dense
        />
      </v-col>
      <v-col cols="4">
        <EditableIntegerField
          label="Min Level"
          :value="encounter.levelMin"
          @change="changeLevelMin"
        />
      </v-col>
      <v-col cols="4">
        <EditableIntegerField
          label="Max Level"
          :value="encounter.levelMax"
          @change="changeLevelMax"
        />
      </v-col>
      <v-col cols="4">
        <EditableIntegerField
          label="Probability"
          :value="encounter.probability * 100"
          @change="(p) => changeProbability(p / 100)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import RandomEncounter from "@/game-engine/map/RandomEncounter";
import LoggerFactory from "@/logger/LoggerFactory";
import SelectMonsterIndex from "../monster-index/SelectMonsterIndex.vue";
import Vue from "vue";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";

export default Vue.extend({
  name: "RandomEncounterEditor",
  components: { EditableIntegerField, SelectMonsterIndex },
  props: { encounter: { type: RandomEncounter } },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.LocalizedEncountersGenerator"),
  }),
  computed: {},
  methods: {
    changeMonster(monster: MonsterIndex | null): void {
      if (monster) {
        this.update((encounter) => (encounter.monsterId = monster.monsterId));
      } else {
        this.$emit("delete");
      }
    },
    changeLevelMax(value: number): void {
      this.update((encounter) => (encounter.levelMax = value));
    },
    changeLevelMin(value: number): void {
      this.update((encounter) => (encounter.levelMin = value));
    },
    changeProbability(value: number): void {
      this.update((encounter) => (encounter.probability = value));
    },
    update(fn: (encounter: RandomEncounter) => void): void {
      const out = this.encounter.clone();
      fn(out);
      this.$emit("change", out);
    },
  },
});
</script>
