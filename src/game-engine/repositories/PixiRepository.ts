import { Service } from "typedi";
import * as PIXI from "pixi.js";

class Entry<E> {
  uuid;
  key;
  sprite;

  public constructor(uuid: string, key: string, sprite: E) {
    this.uuid = uuid;
    this.key = key;
    this.sprite = sprite;
  }
}

export class SpritesConstants {
  public static MONSTER = "MONSTER";
  public static MAP_TILE = "MAP_TILE";
}

export class ContainersConstants {
  public static BATTLE = "BATTLE";
  public static MONSTER = "MONSTER";
}

class Repository<E> {
  protected _entries: Entry<E>[] = [];

  public add(uuid: string, key: string, sprite: E): void {
    this.remove(uuid, key);
    this._entries.push(new Entry<E>(uuid, key, sprite));
  }

  public find(uuid: string, key: string): E | null {
    const entries = this._entries.filter(
      (e) => e.uuid === uuid && e.key === key
    );
    if (entries.length > 0) {
      return entries[0].sprite;
    }
    return null;
  }

  public remove(uuid: string, key: string | null = null): void {
    this._entries = this._entries.filter(
      (e) => !(e.uuid === uuid && (e.key === key || key === null))
    );
  }
}

@Service()
export class PixiSpriteRepository extends Repository<PIXI.Sprite> {}

@Service()
export class PixiContainerRepository extends Repository<PIXI.Container> {}
