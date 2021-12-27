import { Service } from "typedi";
import * as PIXI from "pixi.js";
import RendererService from "@/services/RendererService";
import GameAssetService from "@/services/GameAssetService";
import MonsterService from "@/services/MonsterService";
import PlayerService from "@/services/PlayerService";
import Container from "typedi";
import MapContainer, { Tile } from "@/models/Map";
import { SpriteType } from "@/models/SpriteConfig";
import { Monster } from "@/models/Character";
import UserActionService from "./UserActionService";
import CoordinateService from "./CoordinateService";
import Point from "@/models/Point";

@Service()
export default class GameService {
  protected lastUserAction = 0;

  protected rendererService = Container.get(RendererService);
  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected monsterService = Container.get<MonsterService>(MonsterService);
  protected playerService = Container.get<PlayerService>(PlayerService);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);

  protected map = new MapContainer();
  protected app: PIXI.Application | null = null;

  public getMap(): MapContainer {
    return this.map;
  }
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
        enemy.coordinates = new Point(6, 6);

        this.map.monsters.push(enemy);

        this.map.monsters.forEach((monster) => this.initMonsterSprite(monster));
        this.getApp().ticker.add(this.gameLoop);
      });
  }

  public getMonsterById(uuid: string): Monster {
    return this.getMap().monsters.filter((m) => m.uuid === uuid)[0];
  }

  protected gameLoop(): void {
    const now = +new Date();
    if (now - this.lastUserAction < 100) {
      return;
    }
    this.lastUserAction = now;
  }
  protected initMapTile(tile: Tile): void {
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

    this.coordinateService.setTileCoordinates(
      tile.sprite,
      tile.coordinates,
      this.map
    );

    this.userActionService.initMapTile(tile.coordinates, tile.sprite);

    this.getApp().stage.addChild(tile.sprite);
  }

  protected initMonsterSprite(monster: Monster): void {
    const monsterFamily = this.monsterService.getMonster(monster.modelId);
    const sprite = this.rendererService.createSprite(monsterFamily.sprite);
    monster.sprite = sprite;

    sprite.width = this.map.options.tileWidth;
    sprite.height = this.map.options.tileHeight;

    if (monster.coordinates) {
      this.coordinateService.setTileCoordinates(
        sprite,
        monster.coordinates,
        this.map
      );
    }

    this.userActionService.initMonster(monster.uuid, sprite);
    this.getApp().stage.addChild(sprite);
  }
}
