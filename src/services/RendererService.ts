import MapContainer, { MapOption } from "@/game-engine/map/MapContainer";
import MonsterIndex from "@/models/MonsterIndex";
import { Monster } from "@/models/Character";
import * as PIXI from "pixi.js";
import Container, { Service } from "typedi";
import { Animation } from "@/models/Animation";
import Tile from "@/game-engine/map/Tile";
import GameAssetService from "./GameAssetService";
import MapRepository from "@/game-engine/map/MapRepository";
import { SpriteType } from "@/models/SpriteConfig";
import CoordinateService from "@/game-engine/CoordinateService";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import HealthBarService from "@/game-engine/monster/HealthBarService";

class Asset {
  name = "";
  url = "";

  public constructor(name = "", url = "") {
    this.name = name;
    this.url = url;
  }
}

@Service()
export default class RendererService {
  private static MONSTER_SPRITE_NAME = "monsterSprite";

  protected gameAssetService =
    Container.get<GameAssetService>(GameAssetService);
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected healthBarService =
    Container.get<HealthBarService>(HealthBarService);

  async loadTiles(map: MapContainer): Promise<void> {
    const mapSprites = map.sprites
      .flatMap((sprite) => sprite.sprites)
      .map((sprite) => {
        return { name: sprite, url: `${process.env.VUE_APP_BACKEND}${sprite}` };
      });

    const images = this.removeDuplicates(mapSprites);
    await this.loadImages(images);
  }

  private loadImages(images: Asset[]): Promise<void> {
    return new Promise<void>((resolve) => {
      PIXI.Loader.shared.add(images).load(() => {
        resolve();
      });
    });
  }

  public async loadSpriteSheets(monsters: MonsterIndex[]): Promise<void> {
    console.log("Load SpriteSheet");

    const assets = monsters.flatMap((m) =>
      m.animationsSrc.map(
        (a) =>
          new Asset(
            `${m.name}_${a.key}`,
            `${process.env.VUE_APP_BACKEND}${a.sprites}`
          )
      )
    );
    await this.loadImages(assets);
    console.log("Load SpriteSheet done", assets);
  }

  private removeDuplicates(images: Asset[]): Asset[] {
    const unique: Asset[] = [];
    images.forEach((image) => {
      if (!unique.find((u) => u.name === image.name)) {
        unique.push(image);
      }
    });
    return unique;
  }

  public createSprite(
    name: string,
    options?: { width?: number; height?: number }
  ): PIXI.Sprite {
    try {
      const sprite = new PIXI.Sprite(
        PIXI.Loader.shared.resources[name].texture
      );
      this.applyOptions(sprite, options);
      return sprite;
    } catch (e) {
      console.error(`Error with sprite ${name}`, e);
      throw e;
    }
  }

  public createAnimatedSprite(
    names: string[],
    options?: { width?: number; height?: number }
  ): PIXI.AnimatedSprite {
    const textures = names.map((name) => PIXI.Texture.from(name));
    const sprite = new PIXI.AnimatedSprite(textures);
    this.applyOptions(sprite, options);
    sprite.animationSpeed = 0.05;
    sprite.play();
    return sprite;
  }

  public createMonsterContainer(
    monster: Monster,
    monsterIndex: MonsterIndex,
    options: MapOption,
    key: string
  ): PIXI.Container {
    const sprite = this.createMonsterSprite(monsterIndex, key);
    sprite.name = RendererService.MONSTER_SPRITE_NAME;

    const container = new PIXI.Container();
    container.name = monster.uuid;
    container.addChild(sprite);

    if (monster.coordinates) {
      const point = this.coordinateService.getTileCoordinates(
        monster.coordinates,
        options
      );
      container.x = point.x;
      container.y = point.y;

      sprite.x = (options.tileWidth - sprite.width) / 2;
      sprite.y = (options.tileHeight - sprite.height) / 2;
    }
    this.healthBarService.createBar(container, monster, options);
    this.userActionService.initMonster(monster.uuid, container);
    return container;
  }
  public getMonsterSprite(container: PIXI.Container): PIXI.AnimatedSprite {
    return container.getChildByName(
      RendererService.MONSTER_SPRITE_NAME
    ) as PIXI.AnimatedSprite;
  }

  protected createMonsterSprite(
    monsterIndex: MonsterIndex,
    key: string
  ): PIXI.AnimatedSprite {
    const metadata = monsterIndex.animations.filter((a) => a.key === key)[0];

    const sheet =
      PIXI.Loader.shared.resources[`${monsterIndex.name}_${key}`].spritesheet;

    if (!sheet) {
      throw Error(
        `Spritesheet for monster=${monsterIndex.name}, key=${key} not found.`
      );
    }
    const textures: PIXI.Texture[] = [];
    metadata.frames.forEach((f) => textures.push(PIXI.Texture.from(f.file)));
    return new PIXI.AnimatedSprite(textures);
  }

  public addMapTile(container: PIXI.Container, tile: Tile): void {
    const spriteConfig = this.gameAssetService.getMapSprite(
      this.mapRepository.getMap(),
      tile.spriteModel
    );

    let sprite = null;
    if (spriteConfig.type === SpriteType.ANIMATED) {
      sprite = this.createAnimatedSprite(spriteConfig.sprites);
    } else {
      throw new Error(`Unknown type ${spriteConfig.type}`);
    }
    sprite.name = `${tile.coordinates.x}_${tile.coordinates.y}`;
    sprite.width = this.mapRepository.getMap().options.tileWidth;
    sprite.height = this.mapRepository.getMap().options.tileHeight;

    this.coordinateService.setTileCoordinates(
      sprite,
      tile.coordinates,
      this.mapRepository.getMap()
    );

    const coordinates = this.coordinateService.getTileCoordinates(
      tile.coordinates,
      this.mapRepository.getMap().options
    );
    const border = new PIXI.Graphics();
    border.lineStyle({ width: 1, color: 0x000000 });
    const x1 = coordinates.x;
    const x2 = coordinates.x + this.mapRepository.getMap().options.tileWidth;
    const y1 = coordinates.y;
    const y2 =
      coordinates.y + this.mapRepository.getMap().options.tileHeight - 1;
    border.moveTo(x1, y1);
    border.lineTo(x1, y2);
    border.lineTo(x2, y2);
    border.lineTo(x2, y1);
    border.moveTo(x1, y1);

    this.userActionService.initMapTile(tile.coordinates, sprite);

    container.addChild(sprite);
    container.addChild(border);
  }

  protected applyOptions(
    sprite: PIXI.Sprite,
    options: { width?: number; height?: number } = { width: 60, height: 60 }
  ): void {
    if (options.width) {
      sprite.width = options.width;
    }
    if (options.height) {
      sprite.height = options.height;
    }
  }
}
