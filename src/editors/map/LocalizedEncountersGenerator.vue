<template>
  <v-card>
    <v-container dense>
      <v-row>
        <v-col cols="2">
          <EditableIntegerField
            label="Top left corner, x"
            :value="spawning1.x"
            @change="
              (x) =>
                changeSpawningArea(x, spawning1.y, spawning2.x, spawning2.y)
            "
          />
        </v-col>
        <v-col cols="2">
          <EditableIntegerField
            label="Top left corner, y"
            :value="spawning1.y"
            @change="
              (y) =>
                changeSpawningArea(spawning1.x, y, spawning2.x, spawning2.y)
            "
          />
        </v-col>
        <v-col cols="2">
          <EditableIntegerField
            label="Bottom right corner, x"
            :value="spawning2.x"
            @change="
              (x) =>
                changeSpawningArea(spawning1.x, spawning1.y, x, spawning2.y)
            "
          />
        </v-col>
        <v-col cols="2">
          <EditableIntegerField
            label="Bottom right corner, y"
            :value="spawning2.y"
            @change="
              (y) =>
                changeSpawningArea(spawning1.x, spawning1.y, spawning2.x, y)
            "
          />
        </v-col>
        <v-col cols="1">
          <EditableIntegerField
            label="Min #"
            :value="localizedEncounters.minMonsters"
            @change="changeMinMonsters"
          />
        </v-col>
        <v-col cols="1">
          <EditableIntegerField
            label="Max #"
            :value="localizedEncounters.maxMonsters"
            @change="changeMaxMonsters"
          />
        </v-col>
        <v-col cols="2">
          <v-btn @click="addMonster"> Add </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          v-for="(encounter, index) of localizedEncounters.encounters"
          :key="index"
        >
          <RandomEncounterEditor
            :encounter="encounter"
            @change="(e) => changeMonster(index, e)"
          />
        </v-col>
        <v-col cols="10"> </v-col>
        <v-col cols="2"> {{ totalProbability }}%</v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import RandomEncounterEditor from "./RandomEncounterEditor.vue";
import LocalizedEncounters from "@/game-engine/map/LocalizedEncounters";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import NumberUtil from "@/utils/NumberUtil";
import Vue from "vue";
import RandomEncounter from "@/game-engine/map/RandomEncounter";

export default Vue.extend({
  name: "LocalizedEncountersGenerator",
  components: { EditableIntegerField, RandomEncounterEditor },
  props: { localizedEncounters: { type: LocalizedEncounters } },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.LocalizedEncountersGenerator"),
  }),
  computed: {
    spawning1(): Point {
      if (this.localizedEncounters.area.length === 0) {
        return new Point(0, 0);
      }
      const x = NumberUtil.min(this.localizedEncounters.area.map((p) => p.x));
      const y = NumberUtil.min(this.localizedEncounters.area.map((p) => p.y));
      return new Point(x, y);
    },
    spawning2(): Point {
      if (this.localizedEncounters.area.length === 0) {
        return new Point(1, 1);
      }
      const x = NumberUtil.max(this.localizedEncounters.area.map((p) => p.x));
      const y = NumberUtil.max(this.localizedEncounters.area.map((p) => p.y));
      return new Point(x, y);
    },
    totalProbability(): number {
      const sum = NumberUtil.sum(
        this.localizedEncounters.encounters.map((e) => e.probability)
      );
      return Math.round(100 * sum);
    },
  },
  methods: {
    addMonster(): void {
      const monster = new RandomEncounter();
      monster.levelMin = 1;
      monster.levelMax = 1;
      this.update((encounters) => encounters.encounters.push(monster));
    },
    changeSpawningArea(x1: number, y1: number, x2: number, y2: number): void {
      const points: Point[] = [];
      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
          points.push(new Point(x, y));
        }
      }
      this.logger.info(
        `Change spawning area (${x1}, ${y1}), (${x2}, ${y2}) => ${points.length}`
      );
      this.update((encounters) => (encounters.area = points));
    },
    changeMinMonsters(value: number): void {
      this.update((e) => (e.minMonsters = value));
    },
    changeMaxMonsters(value: number): void {
      this.update((e) => (e.maxMonsters = value));
    },
    changeMonster(index: number, encounter: RandomEncounter): void {
      this.logger.info(`Change monster ${index}: ${encounter.toString()}`);
      this.update((e) => {
        e.encounters.splice(index, 1);
        const part2 = e.encounters.splice(index);
        e.encounters.push(encounter, ...part2);
      });
    },
    update(fn: (localizedEncounters: LocalizedEncounters) => void): void {
      const out = this.localizedEncounters.clone();
      fn(out);
      this.$emit("change", out);
    },
  },
});
</script>
