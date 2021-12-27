import { Service } from "typedi";
import * as PIXI from "pixi.js";
import { InteractionEvent } from "pixi.js";
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

@Service()
export default class GameService {
  protected lastUserAction = 0;

  protected rendererService = Container.get(RendererService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected playerService = Container.get<PlayerService>(PlayerService);

  protected map = new MapContainer();
  protected app : PIXI.Application | null = null;

  public getApp(): PIXI.Application {
    if (this.app) {
      return this.app;
    }
    throw new Error("App not initialized");
  }

  public async init(): Promise<void> {
    this.app = new PIXI.Application({
      width: 800,
      height: 600,
      autoDensity: true,
    });
    this.map = await this.gameAssetService.getMap("map1");
    this.monsterService.init(await this.gameAssetService.getMonstersData());
    this.rendererService
      .loadAssets(this.map, this.monsterService.getMonsters())
      .then(() => {
        this.map.tiles.forEach((tile) => this.initMapTile(tile));

        this.map.monsters.push(...this.playerService.getMonsters());

        const enemy = this.monsterService.createMonster(null);
        enemy.x = 6;
        enemy.y = 6;
        this.map.monsters.push(enemy);

        this.map.monsters.forEach((monster) => this.initMonsterSprite(monster));
        this.getApp().ticker.add(this.gameLoop);
      });
  }

  protected gameLoop() {
    const now = +new Date();
    if (now - this.lastUserAction < 100) {
      return;
    }
    this.lastUserAction = now;
  }
  userInput(e: InteractionEvent, uuid: string): void {
    console.log(uuid, e.type, e);
  }
  public initMapTile(tile: Tile) {
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
    this.getApp().stage.addChild(tile.sprite);
  }

  public initMonsterSprite(monster: Monster) {
    const monsterFamily = this.monsterService.getMonster(monster.modelId);
    const sprite = this.rendererService.createSprite(monsterFamily.sprite);
    monster.sprite = sprite;

    sprite.width = this.map.options.tileWidth;
    sprite.height = this.map.options.tileHeight;
    sprite.x = this.map.options.tileWidth * monster.x;
    sprite.y = this.map.options.tileHeight * monster.y;

    sprite.interactive = true;
    sprite.on("pointertap", (e: InteractionEvent) => this.userInput(e, monster.uuid));

    this.getApp().stage.addChild(sprite);
  }
}
