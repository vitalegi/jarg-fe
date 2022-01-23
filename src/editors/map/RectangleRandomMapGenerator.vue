<template>
  <v-container>
    <v-row>
      <v-col cols="12" v-if="hasErrors">
        <v-alert dense border="right" colored-border type="error" elevation="2">
          {{ errors }}
        </v-alert>
      </v-col>
      <v-col cols="12" style="text-align: right" v-else>
        <CopyToClipboardBtn :value="exportJson" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">
        <EditableTextField label="ID" :value="id" @change="(v) => (id = v)" />
      </v-col>
      <v-col cols="2">
        <EditableTextField
          label="Name"
          :value="name"
          @change="(v) => (name = v)"
        />
      </v-col>
      <v-col cols="2">
        <EditableIntegerField
          label="Width"
          :value="width"
          @change="(w) => (width = w)"
        />
      </v-col>
      <v-col cols="2">
        <EditableIntegerField
          label="Height"
          :value="height"
          @change="(h) => (height = h)"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">Player spawning area</v-col>
      <v-col cols="2">
        <EditableIntegerField
          label="Top left corner, x"
          :value="playerSpawning1.x"
          @change="(x) => (playerSpawning1.x = x)"
        />
      </v-col>
      <v-col cols="2">
        <EditableIntegerField
          label="Top left corner, y"
          :value="playerSpawning1.y"
          @change="(y) => (playerSpawning1.y = y)"
        />
      </v-col>
      <v-col cols="2">
        <EditableIntegerField
          label="Bottom right corner, x"
          :value="playerSpawning2.x"
          @change="(x) => (playerSpawning2.x = x)"
        />
      </v-col>
      <v-col cols="2">
        <EditableIntegerField
          label="Bottom right corner, y"
          :value="playerSpawning2.y"
          @change="(y) => (playerSpawning2.y = y)"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">Spawning Monsters</v-col>
      <v-col cols="2">
        <v-btn @click="addLocalizedEncounter">Add</v-btn>
      </v-col>
      <v-col
        cols="12"
        v-for="(encounters, index) in localizedEncounters"
        :key="index"
      >
        <LocalizedEncountersGenerator
          :localizedEncounters="encounters"
          @change="(e) => changeLocalizedEncounters(index, e)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import EditableTextField from "@/components/EditableTextField.vue";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import LocalizedEncounters from "@/game-engine/map/LocalizedEncounters";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import Vue from "vue";
import CopyToClipboardBtn from "@/components/CopyToClipboardBtn.vue";
import LocalizedEncountersGenerator from "./LocalizedEncountersGenerator.vue";
import MapModel from "@/game-engine/map/MapModel";
import SpriteConfig from "@/models/SpriteConfig";
import Tile from "@/game-engine/map/Tile";

export default Vue.extend({
  name: "RectangleRandomMapGenerator",
  components: {
    EditableTextField,
    EditableIntegerField,
    LocalizedEncountersGenerator,
    CopyToClipboardBtn,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.RectangleRandomMapGenerator"),
    id: "",
    name: "",
    width: 20,
    height: 10,
    playerSpawning1: new Point(0, 0),
    playerSpawning2: new Point(2, 2),
    localizedEncounters: new Array<LocalizedEncounters>(),
  }),
  computed: {
    model(): MapModel {
      const model = new MapModel();
      model.id = this.id;
      model.name = this.name;
      // TODO manage sprite creation
      model.sprites.push(
        SpriteConfig.fromJson({
          name: "grass",
          type: "ANIMATED",
          sprites: [
            "/maps/sprites/backgrounds/grass1.png",
            "/maps/sprites/backgrounds/grass2.png",
          ],
          walkable: true,
          swimmable: false,
        })
      );
      model.sprites.push(
        SpriteConfig.fromJson({
          name: "grass2",
          type: "ANIMATED",
          sprites: [
            "/maps/sprites/backgrounds/grass3.png",
            "/maps/sprites/backgrounds/grass4.png",
          ],
          walkable: false,
          swimmable: false,
        })
      );
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const tile = new Tile();
          tile.spriteModel = Math.random() < 0.5 ? "grass" : "grass2";
          tile.coordinates = new Point(x, y);
          model.tiles.push(tile);
        }
      }

      model.randomEncounters = this.localizedEncounters;
      for (let x = this.playerSpawning1.x; x <= this.playerSpawning2.x; x++) {
        for (let y = this.playerSpawning1.y; y <= this.playerSpawning2.y; y++) {
          model.playerEntryPoints.push(new Point(x, y));
        }
      }
      return model;
    },
    hasErrors(): boolean {
      try {
        this.model.validate();
        return false;
      } catch (e) {
        return true;
      }
    },
    errors(): string {
      try {
        this.model.validate();
        return "";
      } catch (e) {
        return e as string;
      }
    },
    exportJson(): string {
      return JSON.stringify(this.model);
    },
  },
  methods: {
    addLocalizedEncounter(): void {
      const localizedEncounter = new LocalizedEncounters();
      localizedEncounter.minMonsters = 1;
      localizedEncounter.maxMonsters = 1;
      this.localizedEncounters.push(localizedEncounter);
    },
    changeLocalizedEncounters(index: number, e: LocalizedEncounters): void {
      this.logger.info(`Change localized encounter ${index}`);
      this.localizedEncounters.splice(index, 1);
      const part2 = this.localizedEncounters.splice(index);
      this.localizedEncounters.push(e, ...part2);
    },
  },
});
</script>
