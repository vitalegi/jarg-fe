import MapContainer from "@/models/Map";
import Point from "@/models/Point";
import { Service } from "typedi";
import * as PIXI from "pixi.js";

@Service()
export default class CoordinateService {
  public setTileCoordinates(
    tile: PIXI.Sprite,
    coordinates: Point,
    map: MapContainer
  ): void {
    const target = this.getTileCoordinates(coordinates, map);
    tile.x = target.x;
    tile.y = target.y;
  }

  public getTileCoordinates(tile: Point, map: MapContainer): Point {
    const x = tile.x * map.options.tileWidth;
    const y = tile.y * map.options.tileHeight;
    return new Point(x, y);
  }
}
