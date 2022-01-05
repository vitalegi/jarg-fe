import MapContainer, { MapOption } from "@/game-engine/map/MapContainer";
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
    const target = this.getTileCoordinates(coordinates, map.options);
    tile.x = target.x;
    tile.y = target.y;
  }

  public getTileCoordinates(tile: Point, options: MapOption): Point {
    const x = tile.x * options.tileWidth;
    const y = tile.y * options.tileHeight;
    return new Point(x, y);
  }
}
