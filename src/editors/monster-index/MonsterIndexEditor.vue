<template>
  <v-card>
    <v-card-title>
      <h4>
        <v-btn icon color="primary" @click="expand(index, !expanded)">
          <v-icon v-if="expanded">mdi-arrow-up-drop-circle</v-icon>
          <v-icon v-else>mdi-arrow-down-drop-circle</v-icon>
        </v-btn>
        {{ index.monsterId }} - {{ index.name }}
      </h4>
      <v-spacer></v-spacer>
      <v-alert
        v-if="hasErrors"
        border="right"
        colored-border
        type="error"
        elevation="2"
      >
        {{ errors }}
      </v-alert>

      <ConfirmDeletion @delete="deleteIndex()" :text="deletionWarningText" />
    </v-card-title>
    <v-card-text v-if="expanded">
      <v-divider></v-divider>
      <MonsterIndexBaseInfoEditor
        :id="index.monsterId"
        :name="index.name"
        :types="index.types"
        @changeId="changeId"
        @changeName="changeName"
        @changeTypes="changeTypes"
      />
      <h5>Animations</h5>
      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Key</th>
              <th class="text-left">Metadata</th>
              <th class="text-left">Sprites</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="animation in index.animationsSrc" :key="animation.key">
              <td>{{ animation.key }}</td>
              <td>{{ animation.metadata }}</td>
              <td>{{ animation.sprites }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-divider></v-divider>
      <h5>Base Stats</h5>
      <StatsEditor :stats="index.baseStats" @change="changeBaseStats" />
      <v-divider></v-divider>
      <h5>Growth Rates</h5>
      <StatsEditor :stats="index.growthRates" @change="changeGrowthRates" />
      <h5>Stats Progression</h5>
      <StatsOverview
        :stats="getStats()"
        headerCol1="Level"
        :col1="levelsOverview"
      />
      <h5>Learnable Abilities</h5>
      <MonsterIndexAbilitiesLearnableEditor
        :abilities="index.learnableAbilities"
        @changeAbilities="changeAbilities"
      />
      <h5>Evolutions</h5>
      <MonsterIndexEvolutionsEditor
        :evolutions="index.evolutions"
        @changeEvolutions="changeEvolutions"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import MonsterIndex from "@/game-engine/model/monster/MonsterIndex";
import Stats from "@/game-engine/model/monster/stats/Stats";
import Vue from "vue";
import StatsEditor from "@/editors/monster-index/StatsEditor.vue";
import StatsOverview from "@/editors/monster-index/StatsOverview.vue";
import MonsterIndexBaseInfoEditor from "@/editors/monster-index/MonsterIndexBaseInfoEditor.vue";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import Container from "typedi";
import StatsService from "@/game-engine/monster/stats/StatsService";
import MonsterIndexAbilitiesLearnableEditor from "@/editors/monster-index/MonsterIndexAbilitiesLearnableEditor.vue";
import MonsterIndexEvolutionsEditor from "@/editors/monster-index/MonsterIndexEvolutionsEditor.vue";
import MonsterEvolution from "@/game-engine/model/monster/evolution/MonsterEvolution";
import Ability from "@/game-engine/model/ability/Ability";
import AbilityLearnable from "@/game-engine/model/ability/AbilityLearnable";

export default Vue.extend({
  name: "MonsterIndexEditor",
  components: {
    StatsEditor,
    MonsterIndexBaseInfoEditor,
    StatsOverview,
    ConfirmDeletion,
    MonsterIndexAbilitiesLearnableEditor,
    MonsterIndexEvolutionsEditor,
  },
  props: {
    index: MonsterIndex,
    expanded: Boolean,
    expand: Function,
    levelsOverview: {
      type: Array,
      default: () => [1, 10, 20, 50, 75, 100],
    },
    monsters: Array,
    abilities: Array,
  },
  data: () => ({
    statsService: Container.get(StatsService),
  }),
  computed: {
    hasErrors(): boolean {
      return !this.index.isValid(
        this.monsters
          .map((m: any) => m as MonsterIndex)
          .map((m) => m.monsterId),
        this.abilities.map((m: any) => m as Ability).map((a) => a.id)
      );
    },
    errors(): string {
      try {
        this.index.validate(
          this.monsters
            .map((m: any) => m as MonsterIndex)
            .map((m) => m.monsterId),
          this.abilities.map((m: any) => m as Ability).map((a) => a.id)
        );
        return "";
      } catch (e) {
        return (e as any).message;
      }
    },
    deletionWarningText(): string {
      return `Deletion of monster ${this.index.monsterId} - ${this.index.name} is an irreversible action. Are you sure you want to proceed?`;
    },
  },
  methods: {
    changeBaseStats(s: Stats): void {
      const index = this.index.clone();
      index.baseStats = s;
      this.$emit("change", index);
    },
    changeGrowthRates(s: Stats): void {
      const index = this.index.clone();
      index.growthRates = s;
      this.$emit("change", index);
    },
    changeId(id: string): void {
      this.$emit("changeId", { oldId: this.index.monsterId, newId: id });
    },
    changeName(name: string): void {
      const index = this.index.clone();
      index.name = name;
      this.$emit("change", index);
    },
    changeTypes(types: string[]): void {
      const index = this.index.clone();
      index.types = types;
      this.$emit("change", index);
    },
    changeAbilities(abilities: AbilityLearnable[]): void {
      const index = this.index.clone();
      index.learnableAbilities = abilities;
      this.$emit("change", index);
    },
    changeEvolutions(evolutions: MonsterEvolution[]): void {
      const index = this.index.clone();
      index.evolutions = evolutions;
      this.$emit("change", index);
    },
    getStats(): Stats[] {
      return this.levelsOverview
        .map((level) => level as number)
        .map((level) =>
          this.statsService.getAttributesByLevel(
            level,
            this.index.baseStats,
            this.index.growthRates
          )
        );
    },
    deleteIndex(): void {
      this.$emit("delete", this.index.monsterId);
    },
  },
});
</script>
