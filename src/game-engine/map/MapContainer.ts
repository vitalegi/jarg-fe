import SpriteConfig from "../../models/SpriteConfig";
import { Monster } from "../../models/Character";
import Tile from "./Tile";

export class MapOption {
  tileWidth = 0;
  tileHeight = 0;

  public static fromJson(tile: any): MapOption {
    const out = new MapOption();
    out.tileHeight = tile.tileHeight;
    out.tileWidth = tile.tileWidth;
    return out;
  }
}

export default class MapContainer {
  id = "";
  name = "";
  options = new MapOption();
  sprites: SpriteConfig[] = [];
  tiles: Tile[] = [];
  monsters: Monster[] = [];

  public static fromJson(map: any): MapContainer {
    const out = new MapContainer();
    out.id = map.id;
    out.name = map.name;
    out.options = MapOption.fromJson(map.options);
    if (map.sprites) {
      out.sprites = map.sprites.map(SpriteConfig.fromJson);
    }
    if (map.tiles) {
      out.tiles = map.tiles.map(Tile.fromJson);
    }
    if (map.monsters) {
      out.monsters = map.monsters.map(Monster.fromJson);
    }
    return out;
  }
}
