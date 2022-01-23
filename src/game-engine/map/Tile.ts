import Point from "@/models/Point";

export default class Tile {
  spriteModel = "";
  coordinates = new Point();

  public static fromJson(tile: any): Tile {
    const out = new Tile();
    out.spriteModel = tile.spriteModel;
    out.coordinates = Point.fromJson(tile);
    return out;
  }

  public clone(): Tile {
    const out = new Tile();
    out.spriteModel = this.spriteModel;
    out.coordinates = this.coordinates.clone();
    return out;
  }
}
