import SpriteConfig from "./SpriteConfig";
import * as PIXI from "pixi.js";
import Character, { Monster } from "./Character";
import Point from "./Point";

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
  coordinates = new Point();
  sprite: PIXI.Sprite | null = null;

  public static create(tile: any): Tile {
    const out = new Tile();
    out.spriteModel = tile.spriteModel;
    out.coordinates = Point.create(tile);
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
      out.sprites = map.sprites.map(SpriteConfig.create);
    }
    if (map.tiles) {
      out.tiles = map.tiles.map(Tile.create);
    }
    if (map.monsters) {
      out.monsters = map.monsters.map(Monster.fromJson);
    }
    return out;
  }
}
