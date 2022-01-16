<template>
  <v-container dense>
    <v-row>
      <v-col cols="12">
        By Level
        <v-btn icon color="primary" class="mx-2" @click="(e) => addEvolution()">
          <v-icon>mdi-plus-box</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      v-for="(evolution, index) in evolutionsByLevel"
      :key="`${evolution.evolutionId}_${index}`"
    >
      <v-col cols="1">
        <v-btn
          icon
          color="error"
          class="mx-2"
          @click="(e) => deleteEvolution(evolution)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="3">
        <EditableTextField
          label="Evolution"
          :value="evolution.evolutionId"
          @change="(evolutionId) => changeEvolutionId(evolution, evolutionId)"
        />
      </v-col>
      <v-col cols="3">
        {{ findMonsterName(evolution.evolutionId) }}
      </v-col>
      <v-col cols="3">
        <EditableIntegerField
          label="Level"
          :value="evolution.level"
          @change="(level) => changeLevel(evolution, level)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import EditableTextField from "@/components/EditableTextField.vue";
import Ability from "@/game-engine/monster-action/ability/Ability";
import MonsterEvolution from "@/game-engine/monster/monster-evolution/MonsterEvolution";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";
import Vue from "vue";
import MonsterIndexEditorRepository from "./MonsterIndexEditorRepository";

export default Vue.extend({
  name: "MonsterIndexEvolutionsEditor",
  props: {
    evolutions: {
      type: Array,
    },
  },
  components: {
    EditableIntegerField,
    EditableTextField,
  },
  data: () => ({
    monsters: Container.get<MonsterIndexEditorRepository>(
      MonsterIndexEditorRepository
    ).load(),
    logger: LoggerFactory.getLogger(
      "Editors.MonsterIndex.MonsterIndexEvolutionsEditor"
    ),
    allAbilities: new Array<Ability>(),
  }),
  computed: {
    evolutionsByLevel(): MonsterEvolution[] {
      return this.getEvolutions()
        .filter((e) => e.isByLevel())
        .sort((a, b) => a.level - b.level);
    },
  },
  methods: {
    findMonster(id: string): MonsterIndex | null {
      const monster = this.monsters.find((m) => m.monsterId === id);
      if (monster) {
        return monster;
      }
      return null;
    },
    findMonsterName(id: string): string {
      const monster = this.findMonster(id);
      if (monster) {
        return monster.name;
      }
      return "???";
    },
    addEvolution(): void {
      const evolutions = this.getEvolutions().map((e) => e.clone());
      evolutions.push(MonsterEvolution.byLevel(this.monsters[0].monsterId, 1));
      this.$emit("changeEvolutions", evolutions);
    },
    changeEvolutionId(evolution: MonsterEvolution, evolutionId: string): void {
      const evolutions = this.getEvolutions().map((e) => e.clone());
      const index = this.findIndex(evolution);
      evolutions[index].evolutionId = evolutionId;
      this.logger.info(`change evolution ${index} id: ${evolutionId}`);
      this.$emit("changeEvolutions", evolutions);
    },
    changeLevel(evolution: MonsterEvolution, level: number): void {
      const evolutions = this.getEvolutions().map((e) => e.clone());
      const index = this.findIndex(evolution);
      evolutions[index].level = level;
      this.logger.info(`change evolution ${index} level: ${level}`);
      this.$emit("changeEvolutions", evolutions);
    },
    deleteEvolution(evolution: MonsterEvolution): void {
      const evolutions = this.getEvolutions().map((e) => e.clone());
      const index = this.findIndex(evolution);
      evolutions.splice(index, 1);
      this.logger.info(`delete evolution ${index}`);
      this.$emit("changeEvolutions", evolutions);
    },
    findIndex(evolution: MonsterEvolution): number {
      return this.getEvolutions().findIndex((e) => e.equals(evolution));
    },
    getEvolutions(): MonsterEvolution[] {
      return this.evolutions as MonsterEvolution[];
    },
  },
});
</script>

<style scoped lang="scss"></style>
