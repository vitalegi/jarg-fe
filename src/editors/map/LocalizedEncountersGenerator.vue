<template>
  <v-card>
    <v-card-title>
      <OpenCloseBtn :open="show" @change="show = !show" /> Monsters
      <v-spacer></v-spacer>
      <v-icon v-if="hasErrors" color="error"> mdi-alert </v-icon>
    </v-card-title>
    <v-card-text v-if="show">
      <v-alert
        v-if="hasErrors"
        dense
        border="right"
        colored-border
        type="error"
        elevation="2"
      >
        {{ errors }}
      </v-alert>
      <v-radio-group v-model="localMode" @change="changeMode" row>
        <v-radio
          :label="`${spawning1.x} ${spawning1.y}`"
          :value="modeSpawning1"
        />
        <v-radio
          :label="`${spawning2.x} ${spawning2.y}`"
          :value="modeSpawning2"
        />
        <v-spacer></v-spacer>
        <v-btn icon color="error" @click="deleteEntry">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-radio-group>
      <v-container class="pa-0">
        <v-row dense>
          <v-col cols="4">
            <EditableIntegerField
              label="Min #"
              :value="localizedEncounters.minMonsters"
              @change="changeMinMonsters"
            />
          </v-col>
          <v-col cols="4">
            <EditableIntegerField
              label="Max #"
              :value="localizedEncounters.maxMonsters"
              @change="changeMaxMonsters"
            />
          </v-col>
          <v-col cols="4" style="text-align: right">
            <v-btn icon @click="addMonster">
              <v-icon> mdi-plus-circle-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col
            cols="12"
            v-for="(encounter, index) of localizedEncounters.encounters"
            :key="index"
            class="pa-0"
          >
            <RandomEncounterEditor
              :encounter="encounter"
              @change="(e) => changeMonster(index, e)"
              @delete="deleteMonster"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import RandomEncounterEditor from "@/editors/map/RandomEncounterEditor.vue";
import LocalizedEncounters from "@/game-engine/map/LocalizedEncounters";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import NumberUtil from "@/utils/NumberUtil";
import Vue from "vue";
import RandomEncounter from "@/game-engine/map/RandomEncounter";
import MapModel from "@/game-engine/map/MapModel";
import OpenCloseBtn from "@/editors/map/OpenCloseBtn.vue";

export default Vue.extend({
  name: "LocalizedEncountersGenerator",
  components: { EditableIntegerField, RandomEncounterEditor, OpenCloseBtn },
  props: {
    model: MapModel,
    mode: String,
    modeSpawning1: String,
    modeSpawning2: String,
    localizedEncounters: { type: LocalizedEncounters },
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.LocalizedEncountersGenerator"),
    localMode: "",
    show: false,
  }),
  computed: {
    hasErrors(): boolean {
      return this.errors.length > 0;
    },
    errors(): string {
      try {
        this.model.validateRandomEncounter(this.localizedEncounters);
      } catch (e) {
        return (e as any).message;
      }
      return "";
    },
    spawning1(): Point {
      const area = this.localizedEncounters.area;
      if (area.length === 0) {
        return new Point(0, 0);
      }
      const x = NumberUtil.min(area.map((p) => p.x));
      const y = NumberUtil.min(area.map((p) => p.y));

      return new Point(x, y);
    },
    spawning2(): Point {
      if (this.localizedEncounters.area.length === 0) {
        return new Point(0, 0);
      }
      const x = NumberUtil.max(this.localizedEncounters.area.map((p) => p.x));
      const y = NumberUtil.max(this.localizedEncounters.area.map((p) => p.y));
      return new Point(x, y);
    },
  },
  methods: {
    addMonster(): void {
      const monster = new RandomEncounter();
      monster.levelMin = 1;
      monster.levelMax = 1;
      this.update((encounters) => encounters.encounters.push(monster));
    },
    changeMode(value: string): void {
      this.$emit("changeMode", value);
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
    deleteMonster(index: number): void {
      this.update((e) => {
        e.encounters.splice(index, 1);
      });
    },
    update(fn: (localizedEncounters: LocalizedEncounters) => void): void {
      const out = this.localizedEncounters.clone();
      fn(out);
      this.$emit("change", out);
    },
    deleteEntry(): void {
      this.$emit("delete");
    },
  },
  mounted(): void {
    this.localMode = this.mode;
  },
});
</script>
