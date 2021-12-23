<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12"> This is {{ name }}! </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import * as PIXI from "pixi.js";
import RendererService from "@/services/RendererService";
import GameAssetService from "@/services/GameAssetService";
import MonsterService from "@/services/MonsterService";
import PlayerService from "@/services/PlayerService";
import Container from "typedi";
import MapContainer, { Tile } from "@/models/Map";
import { SpriteType } from "@/models/SpriteConfig";
import {
  CharacterType,
  Monster,
  MonsterIndex,
  Stats,
} from "@/models/Character";

export default Vue.extend({
  name: "GameEngine",

  data: () => ({
    name: "JaRG",
    rendererService: Container.get(RendererService),
    gameAssetService: Container.get<GameAssetService>(GameAssetService),
    monsterService: Container.get<MonsterService>(MonsterService),
    playerService: Container.get<PlayerService>(PlayerService),
    map: new MapContainer(),
    app: new PIXI.Application({ width: 800, height: 600, autoDensity: true }),
    lastUserAction: 0,
  }),
  methods: {
    initMap() {
      console.log("done");

      this.map.tiles.forEach((tile) => this.initMapTile(tile));

      this.map.monsters.push(...this.playerService.getMonsters());

      this.map.monsters.forEach((monster) => this.initMonsterSprite(monster));

      this.app.ticker.add(this.gameLoop);
    },
    initMapTile(tile: Tile) {
      const spriteConfig = this.gameAssetService.getMapSprite(
        this.map,
        tile.spriteModel
      );
      if (spriteConfig.type === SpriteType.ANIMATED) {
        tile.sprite = this.rendererService.createAnimatedSprite(
          spriteConfig.sprites
        );
      } else {
        throw new Error(`Unknown type ${spriteConfig.type}`);
      }
      tile.sprite.width = this.map.options.tileWidth;
      tile.sprite.height = this.map.options.tileHeight;
      tile.sprite.x = tile.x * this.map.options.tileWidth;
      tile.sprite.y = tile.y * this.map.options.tileHeight;
      this.app.stage.addChild(tile.sprite);
    },
    initMonsterSprite(monster: Monster) {
      const monsterFamily = this.monsterService.getMonster(monster.modelId);
      const sprite = this.rendererService.createSprite(monsterFamily.sprite);
      monster.sprite = sprite;

      sprite.width = this.map.options.tileWidth;
      sprite.height = this.map.options.tileHeight;
      sprite.x = this.map.options.tileWidth * monster.x;
      sprite.y = this.map.options.tileHeight * monster.y;
      this.app.stage.addChild(sprite);
    },
    gameLoop() {
      const now = +new Date();
      if (now - this.lastUserAction < 100) {
        return;
      }
      this.lastUserAction = now;
      const m = this.map.monsters[0];
      const direction = Math.round(4 * Math.random());
      if (direction === 0 && m.y > 0) {
        m.y--;
      }
      if (direction === 1 && m.y < 9) {
        m.y++;
      }
      if (direction === 2 && m.x > 0) {
        m.x--;
      }
      if (direction === 3 && m.x < 10) {
        m.x++;
      }
      if (m.sprite) {
        m.sprite.x = 60 * m.x;
        m.sprite.y = 60 * m.y;
      }
    },
  },
  async mounted() {
    this.$el.appendChild(this.app.view);
    this.map = await this.gameAssetService.getMap("map1");
    this.monsterService.init(await this.gameAssetService.getMonstersData());
    this.rendererService
      .loadAssets(this.map, this.monsterService.getMonsters())
      .then(this.initMap);
  },
});
</script>
