<template>
  <v-container class="pa-0">
    <v-row dense>
      <v-col cols="12">
        <SelectMonsterIndex
          label="Monster"
          :initialValueId="encounter.monsterId"
          @change="changeMonster"
          @reset="() => changeMonster(null)"
          dense
        />
      </v-col>
      <v-col cols="6">
        <EditableIntegerField
          label="Min L."
          :value="encounter.levelMin"
          @change="changeLevelMin"
        />
      </v-col>
      <v-col cols="6">
        <EditableIntegerField
          label="Max L."
          :value="encounter.levelMax"
          @change="changeLevelMax"
        />
      </v-col>
      <v-col cols="4">
        <EditableIntegerField
          label="%"
          :value="encounter.probability * 100"
          @change="(p) => changeProbability(p / 100)"
        />
      </v-col>
      <v-col cols="8">
        <v-switch
          v-model="catchable"
          @change="changeCatchable"
          label="Can catch?"
        ></v-switch>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import RandomEncounter from "@/game-engine/model/map/RandomEncounter";
import LoggerFactory from "@/logger/LoggerFactory";
import SelectMonsterIndex from "@/editors/monster-index/SelectMonsterIndex.vue";
import Vue from "vue";
import MonsterIndex from "@/game-engine/model/monster/MonsterIndex";

export default Vue.extend({
  name: "RandomEncounterEditor",
  components: { EditableIntegerField, SelectMonsterIndex },
  props: { encounter: { type: RandomEncounter } },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.LocalizedEncountersGenerator"),
    catchable: true,
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
    changeCatchable(value: boolean): void {
      this.update((encounter) => (encounter.catchable = value));
    },
    update(fn: (encounter: RandomEncounter) => void): void {
      const out = this.encounter.clone();
      fn(out);
      this.$emit("change", out);
    },
  },
  mounted(): void {
    this.logger.debug("refresh catchable - mounted");
    this.catchable = this.encounter.catchable;
  },
  updated(): void {
    this.logger.debug("refresh catchable - updated");
    this.catchable = this.encounter.catchable;
  },
});
</script>
