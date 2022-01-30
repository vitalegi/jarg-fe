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
      <v-col cols="2">
        <v-btn @click="addLocalizedEncounter">Add Monsters</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-card>
          <v-card-title>Background</v-card-title>
          <v-radio-group v-model="mode" row>
            <v-radio
              v-for="sprite of sprites"
              :key="sprite.name"
              :label="sprite.name"
              :value="`BACKGROUND_${sprite.name}`"
            />
          </v-radio-group>
        </v-card>
        <v-card>
          <v-card-title>Player Spawning Area</v-card-title>
          <v-radio-group v-model="mode" row>
            <v-radio
              :label="`${playerSpawning1.x} ${playerSpawning1.y}`"
              value="PLAYER_SPAWNING_1"
            />
            <v-radio
              :label="`${playerSpawning2.x} ${playerSpawning2.y}`"
              value="PLAYER_SPAWNING_2"
            />
          </v-radio-group>
        </v-card>
        <LocalizedEncountersGenerator
          v-for="(encounters, index) in localizedEncounters"
          :key="index"
          :localizedEncounters="encounters"
          :model="model"
          :mode="mode"
          @changeMode="(m) => (mode = m)"
          :modeSpawning1="`MONSTERS_SPAWNING_${index}_1`"
          :modeSpawning2="`MONSTERS_SPAWNING_${index}_2`"
          @change="(e) => changeLocalizedEncounters(index, e)"
        />
      </v-col>
      <v-col cols="9">
        <table id="map">
          <tr v-for="row of rows" :key="row">
            <td
              v-for="col of cols"
              :key="col"
              @click="(e) => click(row, col)"
              :class="hasFocus(row, col) ? 'focus' : ''"
            >
              <img :src="getSpriteImage(row, col)" v-if="hasSprite(row, col)" />
              <div v-else>{{ getModel(row, col) }}</div>
            </td>
          </tr>
        </table>
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
import NumberUtil from "@/utils/NumberUtil";

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
    sprites: [
      SpriteConfig.fromJson({
        name: "grass",
        type: "ANIMATED",
        sprites: [
          "/maps/sprites/backgrounds/grass1.png",
          "/maps/sprites/backgrounds/grass2.png",
        ],
        walkable: true,
        swimmable: false,
      }),
      SpriteConfig.fromJson({
        name: "grass2",
        type: "ANIMATED",
        sprites: [
          "/maps/sprites/backgrounds/grass3.png",
          "/maps/sprites/backgrounds/grass4.png",
        ],
        walkable: false,
        swimmable: false,
      }),
    ],
    mode: "",
    tiles: new Array<Array<string>>(),
    playerSpawning1: new Point(0, 0),
    playerSpawning2: new Point(2, 2),
    localizedEncounters: new Array<LocalizedEncounters>(),
  }),
  computed: {
    rows(): number[] {
      const rows = [];
      for (let i = 0; i < this.height; i++) {
        rows.push(i);
      }
      return rows;
    },
    cols(): number[] {
      const cols = [];
      for (let i = 0; i < this.width; i++) {
        cols.push(i);
      }
      return cols;
    },
    model(): MapModel {
      const model = new MapModel();
      model.id = this.id;
      model.name = this.name;
      // TODO manage sprite creation
      model.sprites.push(...this.sprites);
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
    isPlayerSpawning(row: number, col: number): boolean {
      if (this.playerSpawning1.x <= row && row <= this.playerSpawning2.x) {
        if (this.playerSpawning1.y <= col && col <= this.playerSpawning2.y) {
          return true;
        }
      }
      return false;
    },
    hasFocus(row: number, col: number): boolean {
      if (
        this.mode === "PLAYER_SPAWNING_1" ||
        this.mode === "PLAYER_SPAWNING_2"
      ) {
        return this.isPlayerSpawning(row, col);
      }
      if (this.mode.startsWith("MONSTERS_SPAWNING_")) {
        const split = this.mode.split("_");
        const index = NumberUtil.parse(split[2]);
        return (
          this.localizedEncounters[index].area.filter(
            (p) => p.x === row && p.y === col
          ).length > 0
        );
      }

      return false;
    },
    getModel(row: number, col: number): string {
      this.expandModel(row, col);
      return this.tiles[row][col];
    },
    hasSprite(row: number, col: number): boolean {
      const model = this.getModel(row, col);
      if (model === "") {
        return false;
      }
      const sprites = this.sprites.filter((s) => s.name === model);
      return sprites.length === 1;
    },
    getSpriteImage(row: number, col: number): string {
      const model = this.getModel(row, col);
      const sprites = this.sprites.filter((s) => s.name === model);
      if (sprites.length === 1) {
        return `${process.env.VUE_APP_BACKEND}${sprites[0].sprites[0]}`;
      }
      return "";
    },
    setModel(row: number, col: number, model: string): void {
      this.expandModel(row, col);
      const r = this.tiles[row];
      let remaining: string[] = [];
      if (col < r.length - 1) {
        remaining = r.splice(col + 1);
      }
      r.splice(col);
      r.push(model, ...remaining);
    },
    expandModel(row: number, col: number): void {
      while (row >= this.tiles.length) {
        const r: string[] = [];
        this.tiles.push(r);
      }
      const r = this.tiles[row];
      while (col >= r.length) {
        r.push("");
      }
    },
    click(row: number, col: number): void {
      this.logger.info(`Mode: ${this.mode} (${row},${col})`);
      if (this.mode === "PLAYER_SPAWNING_1") {
        this.changePlayerSpawningArea(true, row, col);
      } else if (this.mode === "PLAYER_SPAWNING_2") {
        this.changePlayerSpawningArea(false, row, col);
      } else if (this.mode.startsWith("BACKGROUND_")) {
        const sprite = this.mode.substring("BACKGROUND_".length);
        this.setModel(row, col, sprite);
      } else if (this.mode.startsWith("MONSTERS_SPAWNING_")) {
        const split = this.mode.split("_");
        const index = NumberUtil.parse(split[2]);
        const topLeft = split[3] === "1";
        this.changeMonsterSpawningArea(index, topLeft, row, col);
      }
    },
    addLocalizedEncounter(): void {
      const localizedEncounter = new LocalizedEncounters();
      localizedEncounter.minMonsters = 1;
      localizedEncounter.maxMonsters = 1;
      this.localizedEncounters.push(localizedEncounter);
    },
    changePlayerSpawningArea(topLeft: boolean, row: number, col: number): void {
      this.logger.info(`Change player spawning area: (${row},${col})`);
      const rect = this.updatePair(
        new Point(this.playerSpawning1.x, this.playerSpawning1.y),
        new Point(this.playerSpawning2.x, this.playerSpawning2.y),
        topLeft,
        new Point(row, col)
      );
      this.playerSpawning1 = rect.point1;
      this.playerSpawning2 = rect.point2;
    },
    changeMonsterSpawningArea(
      index: number,
      topLeft: boolean,
      row: number,
      col: number
    ): void {
      this.logger.info(`Change spawning area of ${index}: (${row},${col})`);
      const encounters = this.localizedEncounters[index].clone();
      this.logger.info(
        `Initial area: ${encounters.area.map((p) => p.toString())}`
      );
      const min = (arr: number[]) => NumberUtil.min(arr);
      const max = (arr: number[]) => NumberUtil.max(arr);
      let x1 = min(encounters.area.map((a) => a.x));
      let x2 = max(encounters.area.map((a) => a.x));
      let y1 = min(encounters.area.map((a) => a.y));
      let y2 = max(encounters.area.map((a) => a.y));
      const rect = this.updatePair(
        new Point(x1, y1),
        new Point(x2, y2),
        topLeft,
        new Point(row, col)
      );
      encounters.area = this.generateArea(
        rect.point1.x,
        rect.point1.y,
        rect.point2.x,
        rect.point2.y
      );
      this.changeLocalizedEncounters(index, encounters);
    },
    changeLocalizedEncounters(index: number, e: LocalizedEncounters): void {
      this.logger.info(`Change localized encounter ${index}`);
      this.localizedEncounters.splice(index, 1);
      const part2 = this.localizedEncounters.splice(index);
      this.localizedEncounters.push(e, ...part2);
    },
    generateArea(
      row1: number,
      col1: number,
      row2: number,
      col2: number
    ): Point[] {
      const points = [];
      for (let row = row1; row <= row2; row++) {
        for (let col = col1; col <= col2; col++) {
          points.push(new Point(row, col));
        }
      }
      return points;
    },
    updatePair(
      point1: Point,
      point2: Point,
      topLeft: boolean,
      newPoint: Point
    ): { point1: Point; point2: Point } {
      let p1 = point1.clone();
      let p2 = point2.clone();
      this.logger.info(
        `Starting from: ${p1.toString()},${p2.toString()}, topLeft: ${topLeft}, newPoint: ${newPoint.toString()}`
      );
      if (topLeft) {
        p1 = newPoint.clone();
        if (p2.x < p1.y) {
          p2.x = p1.x;
        }
        if (p2.y < p1.y) {
          p2.y = p1.y;
        }
        this.logger.info(`Moving top left: ${p1.toString()},${p2.toString()}`);
      } else {
        p2 = newPoint.clone();
        if (p2.x < p1.x) {
          p1.x = p2.x;
        }
        if (p2.y < p1.y) {
          p1.y = p2.y;
        }
        this.logger.info(
          `Moving bottom right: ${p1.toString()},${p2.toString()}`
        );
      }
      return { point1: p1, point2: p2 };
    },
  },
  mounted(): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.setModel(row, col, this.sprites[0].name);
      }
    }
  },
});
</script>

<style lang="scss" scoped>
#map td {
  width: 30px;
  border: 1px solid black;
}
#map tr {
  height: 30px;
}
#map {
  border-collapse: collapse;
  border: 1px solid black;
}
#map img {
  width: 100%;
  display: block;
}
.focus {
  opacity: 0.6;
}
</style>
