import Monster from "@/game-engine/monster/Monster";
import Tile from "./Tile";

export default class MapContainer {
  id = "";
  name = "";
  tiles: Tile[] = [];
  monsters: Monster[] = [];

  public static fromJson(map: any): MapContainer {
    const out = new MapContainer();
    out.id = map.id;
    out.name = map.name;
    if (map.tiles) {
      out.tiles = map.tiles.map(Tile.fromJson);
    }
    if (map.monsters) {
      out.monsters = map.monsters.map(Monster.fromJson);
    }
    return out;
  }
}
