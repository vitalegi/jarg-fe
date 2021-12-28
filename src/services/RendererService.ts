import MapContainer from "@/models/Map";
import { MonsterIndex } from "@/models/Character";
import * as PIXI from "pixi.js";
import { Service } from "typedi";

class Asset {
  name = "";
  url = "";
}

@Service()
export default class RendererService {
  async loadAssets(map: MapContainer, monsters: MonsterIndex[]): Promise<void> {
    const mapSprites = map.sprites
      .flatMap((sprite) => sprite.sprites)
      .map((sprite) => {
        return { name: sprite, url: sprite };
      });
    const monstersSprites = monsters
      .map((monster) => monster.sprite)
      .map((sprite) => {
        return { name: sprite, url: sprite };
      });

    const images = this.removeDuplicates([...mapSprites, ...monstersSprites]);
    await this.loadImages(images);
  }

  private loadImages(images: Asset[]): Promise<void> {
    return new Promise<void>((resolve) => {
      PIXI.Loader.shared.add(images).load(() => {
        resolve();
      });
    });
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
