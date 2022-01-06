import SpriteConfig from "@/models/SpriteConfig";
import LocalizedEncounters from "./LocalizedEncounters";
import Tile from "./Tile";

export default class MapModel {
  id = "";
  name = "";
  sprites: SpriteConfig[] = [];
  tiles: Tile[] = [];
  randomEncounters: LocalizedEncounters[] = [];

  public static fromJson(json: any): MapModel {
    const out = new MapModel();
    out.id = json.id;
    out.name = json.name;
    if (json.sprites) {
      out.sprites = json.sprites.map(SpriteConfig.fromJson);
    }
    if (json.tiles) {
      out.tiles = json.tiles.map(Tile.fromJson);
    }
    if (json.randomEncounters) {
      out.randomEncounters = json.randomEncounters.map(
        LocalizedEncounters.fromJson
      );
    }
    return out;
  }
}
