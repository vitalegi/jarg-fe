import Point from "@/models/Point";
import { Service } from "typedi";
import * as PIXI from "pixi.js";
import GameConfig from "@/game-engine/GameConfig";

@Service()
export default class CoordinateService {
  public setTileCoordinates(tile: PIXI.Sprite, coordinates: Point): void {
    const target = this.getTileCoordinates(coordinates);
    tile.x = target.x;
    tile.y = target.y;
  }

  public getTileCoordinates(tile: Point): Point {
    const x = tile.x * GameConfig.SHARED.tile.width;
    const y = tile.y * GameConfig.SHARED.tile.height;
    return new Point(x, y);
  }
}
