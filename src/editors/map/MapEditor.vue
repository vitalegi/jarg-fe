<template>
  <v-container class="pa-0">
    <v-row>
      <v-col cols="8">
        <v-alert
          dense
          v-if="hasErrors"
          border="right"
          colored-border
          type="error"
          elevation="2"
        >
          {{ errors }}
        </v-alert>
      </v-col>
      <v-col cols="4" style="text-align: right">
        <ImportDialog
          title="Import map"
          :initialValue="exportJson"
          @change="importJson"
        />
        <CopyToClipboardBtn :value="exportJson" />
      </v-col>
    </v-row>
    <v-row>
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
      <v-col cols="3" class="pa-0">
        <v-container fluid>
          <v-row dense>
            <v-col cols="12">
              <BackgroundEditor :sprites="sprites" @change="changeBackground" />
            </v-col>
            <v-col cols="12">
              <PlayerSpawnEditor
                :playerSpawning1="playerSpawning1"
                :playerSpawning2="playerSpawning2"
                label1="PLAYER_SPAWNING_1"
                label2="PLAYER_SPAWNING_2"
                @change="changePlayerSpawning"
              />
            </v-col>
            <v-col
              cols="12"
              v-for="(encounters, index) in localizedEncounters"
              :key="index"
            >
              <LocalizedEncountersGenerator
                :localizedEncounters="encounters"
                :model="model"
                :mode="mode"
                :modeSpawning1="`MONSTERS_SPAWNING_${index}_1`"
                :modeSpawning2="`MONSTERS_SPAWNING_${index}_2`"
                @changeMode="(m) => (mode = m)"
                @change="(e) => changeLocalizedEncounters(index, e)"
                @delete="(e) => deleteLocalizedEncounters(index)"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="9" class="pa-0">
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
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import LocalizedEncounters from "@/game-engine/model/map/LocalizedEncounters";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import Vue from "vue";
import CopyToClipboardBtn from "@/components/CopyToClipboardBtn.vue";
import LocalizedEncountersGenerator from "@/editors/map/LocalizedEncountersGenerator.vue";
import MapModel from "@/game-engine/model/map/MapModel";
import SpriteConfig from "@/models/SpriteConfig";
import Tile from "@/game-engine/model/map/Tile";
import NumberUtil from "@/utils/NumberUtil";
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";
import Container from "typedi";
import TileRepository from "@/game-engine/repositories/TileRepository";
import BackgroundEditor from "@/editors/map/BackgroundEditor.vue";
import PlayerSpawnEditor from "@/editors/map/PlayerSpawnEditor.vue";
import RandomEncounter from "@/game-engine/model/map/RandomEncounter";
import ImportDialog from "@/components/ImportDialog.vue";

const DEFAULT_POINT = new Point(-1000, -1000);

export default Vue.extend({
  name: "MapEditor",
  components: {
    EditableIntegerField,
    LocalizedEncountersGenerator,
    CopyToClipboardBtn,
    BackgroundEditor,
    PlayerSpawnEditor,
    ImportDialog,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.MapEditor"),
    sprites: new Array<SpriteConfig>(),
    width: 20,
    height: 10,
    mode: "",
    selectArea: false,
    selectAreaPoint1: DEFAULT_POINT,
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

      this.tiles.forEach((columns: string[], row: number) =>
        columns.forEach((modelName: string, col: number) => {
          if (modelName !== "") {
            const tile = new Tile();
            tile.spriteModel = modelName;
            tile.coordinates = new Point(col, row);
            model.tiles.push(tile);
          }
        })
      );

      model.randomEncounters = this.localizedEncounters.map((e) => e.clone());
      for (
        let col = this.playerSpawning1.x;
        col <= this.playerSpawning2.x;
        col++
      ) {
        for (
          let row = this.playerSpawning1.y;
          row <= this.playerSpawning2.y;
          row++
        ) {
          model.playerEntryPoints.push(new Point(col, row));
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
    isPlayerSpawningMode(): boolean {
      return (
        this.mode === "PLAYER_SPAWNING_1" || this.mode === "PLAYER_SPAWNING_2"
      );
    },
    isBackgroundMode(): boolean {
      return this.mode.startsWith("BACKGROUND_") || this.mode === "BACKGROUND";
    },
    isMonsterSpawningMode(): boolean {
      return this.mode.startsWith("MONSTERS_SPAWNING_");
    },
  },
  methods: {
    isPlayerSpawning(row: number, col: number): boolean {
      if (this.playerSpawning1.x <= col && col <= this.playerSpawning2.x) {
        if (this.playerSpawning1.y <= row && row <= this.playerSpawning2.y) {
          return true;
        }
      }
      return false;
    },
    isMonsterSpawning(index: number, row: number, col: number): boolean {
      return (
        this.localizedEncounters[index].area
          .filter((p) => p.y === row)
          .filter((p) => p.x === col).length > 0
      );
    },
    hasFocus(row: number, col: number): boolean {
      if (this.isPlayerSpawningMode) {
        return this.isPlayerSpawning(row, col);
      }
      if (this.isMonsterSpawningMode) {
        const split = this.mode.split("_");
        const index = NumberUtil.parseAsInt(split[2]);
        return this.isMonsterSpawning(index, row, col);
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
        return this.getImage(sprites[0]);
      }
      return "";
    },
    getImage(config: SpriteConfig): string {
      return `${process.env.VUE_APP_BACKEND}${config.sprites[0]}`;
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
      this.logger.info(`Mode: ${this.mode} (${col},${row})`);
      if (this.isPlayerSpawningMode) {
        if (this.mode === "PLAYER_SPAWNING_1") {
          this.changePlayerSpawningArea(true, row, col);
        } else if (this.mode === "PLAYER_SPAWNING_2") {
          this.changePlayerSpawningArea(false, row, col);
        }
      } else if (this.isBackgroundMode) {
        if (this.mode === "BACKGROUND") {
          this.selectBackground("", row, col);
        } else {
          const sprite = this.mode.split("_")[1];
          this.selectBackground(sprite, row, col);
        }
      } else if (this.isMonsterSpawningMode) {
        const split = this.mode.split("_");
        const index = NumberUtil.parseAsInt(split[2]);
        const topLeft = split[3] === "1";
        this.changeMonsterSpawningArea(index, topLeft, row, col);
      }
    },
    addLocalizedEncounter(): void {
      const localizedEncounter = new LocalizedEncounters();
      localizedEncounter.minMonsters = 1;
      localizedEncounter.maxMonsters = 1;
      const randomEncounter = new RandomEncounter();
      randomEncounter.levelMin = 1;
      randomEncounter.levelMax = 1;
      randomEncounter.probability = 1;
      localizedEncounter.encounters.push(randomEncounter);
      this.localizedEncounters.push(localizedEncounter);
    },
    changePlayerSpawningArea(topLeft: boolean, row: number, col: number): void {
      this.logger.info(`Change player spawning area: (${col},${row})`);
      const rect = this.updatePair(
        new Point(this.playerSpawning1.x, this.playerSpawning1.y),
        new Point(this.playerSpawning2.x, this.playerSpawning2.y),
        topLeft,
        new Point(col, row)
      );
      this.playerSpawning1 = rect.point1;
      this.playerSpawning2 = rect.point2;
    },
    selectBackground(sprite: string, row: number, col: number): void {
      if (this.selectArea) {
        if (this.selectAreaPoint1 === DEFAULT_POINT) {
          this.logger.info(
            `background single point start: row=${row}, col=${col}`
          );
          this.selectAreaPoint1 = new Point(col, row);
        } else {
          const p1 = this.selectAreaPoint1;
          const p2 = new Point(col, row);
          this.logger.info(`background area end: p1=${p1}, p2=${p2}`);
          this.selectAreaPoint1 = DEFAULT_POINT;
          const x1 = Math.min(p1.x, p2.x);
          const y1 = Math.min(p1.y, p2.y);
          const x2 = Math.max(p1.x, p2.x);
          const y2 = Math.max(p1.y, p2.y);
          for (let row = y1; row <= y2; row++) {
            for (let col = x1; col <= x2; col++) {
              this.setModel(row, col, sprite);
            }
          }
        }
      } else {
        this.logger.info(`background area start: row=${row}, col=${col}`);
        this.setModel(row, col, sprite);
      }
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
        new Point(col, row)
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
    deleteLocalizedEncounters(index: number): void {
      this.logger.info(`Delete localized encounter ${index}`);
      this.localizedEncounters.splice(index, 1);
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
        if (p2.x < p1.x) {
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
    changeBackground(value: { selectArea: boolean; sprite: string }): void {
      this.selectArea = value.selectArea;
      this.mode = value.sprite;
    },
    changePlayerSpawning(mode: string): void {
      this.mode = mode;
    },
    importJson(json: string): void {
      const map = MapModel.fromJson(JSON.parse(json));
      this.width =
        1 +
        NumberUtil.max(
          map.tiles.map((t) => t.coordinates.x),
          20
        );
      this.height =
        1 +
        NumberUtil.max(
          map.tiles.map((t) => t.coordinates.y),
          15
        );
      this.tiles.splice(0);
      for (let row = 0; row < this.height; row++) {
        for (let col = 0; col < this.width; col++) {
          const points = map.tiles.filter((v) =>
            v.coordinates.equals(new Point(col, row))
          );
          if (points.length > 0) {
            this.setModel(row, col, points[0].spriteModel);
          }
        }
      }

      this.playerSpawning1 = new Point(
        NumberUtil.min(
          map.playerEntryPoints.map((p) => p.x),
          0
        ),
        NumberUtil.min(
          map.playerEntryPoints.map((p) => p.y),
          0
        )
      );
      this.playerSpawning2 = new Point(
        NumberUtil.max(
          map.playerEntryPoints.map((p) => p.x),
          0
        ),
        NumberUtil.max(
          map.playerEntryPoints.map((p) => p.y),
          0
        )
      );
      this.localizedEncounters = map.randomEncounters.map((e) => e.clone());
    },
  },
  async mounted(): Promise<void> {
    const gameAppDataLoader = Container.get(GameAppDataLoader);
    const tileRepository = Container.get(TileRepository);
    await gameAppDataLoader.loadSpriteConfigs();
    this.sprites.push(...tileRepository.getAllTiles());
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
