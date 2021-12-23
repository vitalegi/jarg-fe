import SpriteConfig from "./SpriteConfig";
import * as PIXI from "pixi.js";
import Character, { Monster } from "./Character";

export class TileOption {
  tileWidth = 0;
  tileHeight = 0;

  public static create(tile: any): TileOption {
    const out = new TileOption();
    out.tileHeight = tile.tileHeight;
    out.tileWidth = tile.tileWidth;
    return out;
  }
}

export class Tile {
  spriteModel = "";
  x = 0;
  y = 0;
  sprite: PIXI.Sprite | null = null;

  public static create(tile: any): Tile {
    const out = new Tile();
    out.spriteModel = tile.spriteModel;
    out.x = tile.x;
    out.y = tile.y;
    out.sprite = tile.sprite;
    return out;
  }
}

export default class MapContainer {
  id = "";
  name = "";
  options = new TileOption();
  sprites: SpriteConfig[] = [];
  tiles: Tile[] = [];
  monsters: Monster[] = [];

  public static create(map: any): MapContainer {
    const out = new MapContainer();
    out.id = map.id;
    out.name = map.name;
    out.options = TileOption.create(map.options);
    if (map.sprites) {
      out.sprites = map.sprites.map((s: any) => SpriteConfig.create(s));
    }
    if (map.tiles) {
      out.tiles = map.tiles.map((tile: any) => Tile.create(tile));
    }
    if (map.monsters) {
      out.monsters = map.monsters.map((m: any) => Monster.createMonster(m));
    }
    return out;
  }
}
