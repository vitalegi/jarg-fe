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
import Container from "typedi";
import MapConfig, { Tile } from "@/models/Map";
import { SpriteType } from "@/models/SpriteConfig";
import Monster from "@/models/Monster";

let squirtle: PIXI.Sprite | null = null;

export default Vue.extend({
  name: "GameEngine",

  data: () => ({
    name: "JaRG",
    rendererService: Container.get(RendererService),
    gameAssetService: Container.get<GameAssetService>(GameAssetService),
    map: new MapConfig(),
    monsters: new Array<Monster>(),
    app: new PIXI.Application({ width: 800, height: 600, autoDensity: true }),
    x: 5,
    y: 5,
    lastUserAction: 0,
  }),
  methods: {
    initMap() {
      console.log("done");

      this.map.tiles.forEach((tile) => this.initMapTile(tile));

      squirtle = this.initMonsterSprite(this.monsters[1]);

      squirtle.x = 60 * this.x;
      squirtle.y = 60 * this.y;
      this.app.stage.addChild(squirtle);

      this.app.ticker.add(this.gameLoop);
    },
    initMapTile(tile: Tile) {
      const spriteConfig = this.gameAssetService.getMapSprite(
        this.map,
        tile.sprite
      );
      let sprite;
      if (spriteConfig.type === SpriteType.ANIMATED) {
        sprite = this.rendererService.createAnimatedSprite(
          spriteConfig.sprites
        );
      } else {
        throw new Error(`Unknown type ${spriteConfig.type}`);
      }
      sprite.width = this.map.options.tileWidth;
      sprite.height = this.map.options.tileHeight;
      sprite.x = tile.x * this.map.options.tileWidth;
      sprite.y = tile.y * this.map.options.tileHeight;
      this.app.stage.addChild(sprite);
    },
    initMonsterSprite(monster: Monster) {
      const sprite = this.rendererService.createSprite(monster.sprite);
      sprite.width = this.map.options.tileWidth;
      sprite.height = this.map.options.tileHeight;
      return sprite;
    },
    gameLoop() {
      const now = +new Date();
      if (now - this.lastUserAction < 100) {
        return;
      }
      this.lastUserAction = now;

      const direction = Math.round(4 * Math.random());
      if (direction === 0 && this.y > 0) {
        this.y--;
      }
      if (direction === 1 && this.y < 9) {
        this.y++;
      }
      if (direction === 2 && this.x > 0) {
        this.x--;
      }
      if (direction === 3 && this.x < 10) {
        this.x++;
      }
      if (squirtle) {
        squirtle.x = 60 * this.x;
        squirtle.y = 60 * this.y;
      }
    },
  },
  async mounted() {
    this.$el.appendChild(this.app.view);
    this.map = await this.gameAssetService.getMap("map1");
    this.monsters = await this.gameAssetService.getMonsters();
    this.rendererService.loadAssets(this.map, this.monsters).then(this.initMap);
  },
});
</script>
