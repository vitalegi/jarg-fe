import Point from "@/models/Point";
import UuidUtil from "@/utils/UuidUtil";

export default class Tile {
  uuid = "";
  spriteModel = "";
  coordinates = new Point();

  public static fromJson(tile: any): Tile {
    const out = new Tile();
    out.uuid = tile.uuid;
    if (!out.uuid) {
      out.uuid = UuidUtil.nextId();
    }
    out.spriteModel = tile.spriteModel;
    out.coordinates = Point.fromJson(tile);
    return out;
  }

  public clone(): Tile {
    const out = new Tile();
    out.uuid = this.uuid;
    out.spriteModel = this.spriteModel;
    out.coordinates = this.coordinates.clone();
    return out;
  }
}
