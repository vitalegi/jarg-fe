import Container, { Service } from "typedi";
import * as PIXI from "pixi.js";
import { InteractionEvent } from "pixi.js";
import Point from "@/models/Point";
import GameService from "@/services/GameService";

@Service()
export default class DragScreenHandler {
  protected _dragStart: Point | null = null;

  public addListener(sprite: PIXI.Sprite): void {
    sprite.interactive = true;
    sprite.on("pointerdown", (e: InteractionEvent) => this.dragStart(e));
    sprite.on("pointermove", (e: InteractionEvent) => this.dragMove(e));
    sprite.on("pointerup", (e: InteractionEvent) => this.dragEnd(e));
  }
  protected dragStart(event: InteractionEvent): void {
    const point = event.data.global;
    this._dragStart = new Point(point.x, point.y);
    console.log("drag start", point);
  }
  protected dragEnd(event: InteractionEvent): void {
    if (!this._dragStart) {
      return;
    }
    console.log(`drag end`);
    this._dragStart = null;
  }
  protected dragMove(event: InteractionEvent): void {
    if (!this._dragStart) {
      return;
    }
    const point = event.data.global;
    const dest = new Point(point.x, point.y);

    const diffX = dest.x - this._dragStart.x;
    const diffY = dest.y - this._dragStart.y;
    if (diffX * diffX + diffY * diffY > 1) {
      const gameService = Container.get<GameService>(GameService);
      console.log(`drag progress ${this._dragStart} => ${dest}`);
      this._dragStart = dest;
      gameService.moveStage(diffX, diffY);
    }
  }
}
