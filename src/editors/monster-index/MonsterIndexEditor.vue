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
      <ConfirmDeletion @delete="deleteIndex()" :text="deletionWarningText" />
    </v-card-title>
    <v-card-text v-if="expanded">
      <v-divider></v-divider>
      <monster-index-base-info-editor
        :id="index.monsterId"
        :name="index.name"
        @changeId="changeId"
        @changeName="changeName"
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
      <stats-editor
        :stats="index.baseStats"
        @change="changeBaseStats"
      ></stats-editor>
      <v-divider></v-divider>
      <h5>Growth Rates</h5>
      <stats-editor
        :stats="index.growthRates"
        @change="changeGrowthRates"
      ></stats-editor>
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
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Stats from "@/game-engine/monster/stats/Stats";
import Vue from "vue";
import StatsEditor from "./StatsEditor.vue";
import StatsOverview from "./StatsOverview.vue";
import MonsterIndexBaseInfoEditor from "./MonsterIndexBaseInfoEditor.vue";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import Container from "typedi";
import StatsService from "@/game-engine/monster/stats/StatsService";
import MonsterIndexAbilitiesLearnableEditor from "./MonsterIndexAbilitiesLearnableEditor.vue";
import AbilityLearnable from "@/game-engine/monster-action/ability/AbilityLearnable";

export default Vue.extend({
  name: "MonsterIndexEditor",
  components: {
    StatsEditor,
    MonsterIndexBaseInfoEditor,
    StatsOverview,
    ConfirmDeletion,
    MonsterIndexAbilitiesLearnableEditor,
  },
  props: {
    index: MonsterIndex,
    expanded: Boolean,
    expand: Function,
    levelsOverview: {
      type: Array,
      default: () => [1, 10, 20, 50, 75, 100],
    },
  },
  data: () => ({
    statsService: Container.get<StatsService>(StatsService),
  }),
  computed: {
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
    changeAbilities(abilities: AbilityLearnable[]): void {
      const index = this.index.clone();
      index.learnableAbilities = abilities;
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
