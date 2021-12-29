import { Service } from "typedi";
import * as PIXI from "pixi.js";

class Entry {
  uuid;
  key;
  sprite;

  public constructor(uuid: string, key: string, sprite: PIXI.Sprite) {
    this.uuid = uuid;
    this.key = key;
    this.sprite = sprite;
  }
}

export class SpritesConstants {
  public static MONSTER = "MONSTER";
  public static MAP_TILE = "MAP_TILE";
}

@Service()
export default class MapSpritesRepository {
  protected _entries: Entry[] = [];

  public add(uuid: string, key: string, sprite: PIXI.Sprite): void {
    this.remove(uuid, key);
    this._entries.push(new Entry(uuid, key, sprite));
  }

  public find(uuid: string, key: string): PIXI.Sprite | null {
    const entries = this._entries.filter(
      (e) => e.uuid === uuid && e.key === key
    );
    if (entries.length > 0) {
      return entries[0].sprite;
    }
    return null;
  }

  public remove(uuid: string, key: string): void {
    this._entries = this._entries.filter(
      (e) => !(e.uuid === uuid && e.key === key)
    );
  }
}
