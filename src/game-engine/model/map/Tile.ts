import Point from "@/models/Point";
import { asString } from "@/utils/JsonUtil";

export default class Tile {
  spriteModel = "";
  coordinates = new Point();

  public static fromJson(tile: any): Tile {
    const out = new Tile();
    out.spriteModel = asString(tile.spriteModel);
    out.coordinates = Point.fromJson(tile.coordinates);
    return out;
  }

  public clone(): Tile {
    const out = new Tile();
    out.spriteModel = this.spriteModel;
    out.coordinates = this.coordinates.clone();
    return out;
  }
}
