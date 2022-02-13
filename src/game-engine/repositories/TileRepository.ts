import MapContainer from "@/game-engine/model/map/MapContainer";
import SpriteConfig from "@/models/SpriteConfig";
import { Service } from "typedi";

@Service()
export default class TileRepository {
  private tiles = new Array<SpriteConfig>();

  public init(tiles: SpriteConfig[]): void {
    this.tiles = tiles.map((b) => b.clone());
  }

  public getTiles(map: MapContainer): SpriteConfig[] {
    return this.tiles
      .filter((t) => map.tiles.find((e) => e.spriteModel === t.name))
      .map((t) => t.clone());
  }
  public getAllTiles(): SpriteConfig[] {
    return this.tiles.map((t) => t.clone());
  }

  public getTile(name: string): SpriteConfig {
    const sprite = this.tiles.filter((s) => s.name === name);
    if (sprite) {
      return sprite[0];
    }
    throw Error(
      `Sprite ${name} not found. Availables: ${this.tiles
        .map((t) => t.name)
        .join(", ")}`
    );
  }
}
