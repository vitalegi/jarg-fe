import MapContainer from "@/models/Map";
import MonsterIndex from "@/models/MonsterIndex";
import { Monster } from "@/models/Character";
import * as PIXI from "pixi.js";
import { Service } from "typedi";
import { Animation } from "@/models/Animation";

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
  async loadAssets(map: MapContainer, monsters: MonsterIndex[]): Promise<void> {
    const mapSprites = map.sprites
      .flatMap((sprite) => sprite.sprites)
      .map((sprite) => {
        return { name: sprite, url: sprite };
      });

    const images = this.removeDuplicates(mapSprites);
    await this.loadImages(images);
    await this.loadSpriteSheets(monsters);
  }

  private loadImages(images: Asset[]): Promise<void> {
    return new Promise<void>((resolve) => {
      PIXI.Loader.shared.add(images).load(() => {
        resolve();
      });
    });
  }

  private async loadSpriteSheets(monsters: MonsterIndex[]): Promise<void> {
    console.log("Load SpriteSheet");

    const assets = monsters.flatMap((m) =>
      m.animationsSrc.map((a) => new Asset(`${m.name}_${a.key}`, a.sprites))
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

  public createMonsterSprite(
    monsterIndex: MonsterIndex,
    key = "normal"
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
