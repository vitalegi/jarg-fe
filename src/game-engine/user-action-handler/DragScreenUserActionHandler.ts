import Container from "typedi";
import Point from "@/models/Point";
import GameService from "@/services/GameService";
import UserActionHandler from "./UserActionHandler";
import UserInput from "./UserInput";

export default class DragScreenUserActionHandler extends UserActionHandler {
  protected _dragStart: Point | null = null;
  protected _lastPoint: Point | null = null;

  public getName(): string {
    return "DragScreenUserActionHandler";
  }

  public acceptDrag(): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processDragStart(input: UserInput, newPosition: Point): void {
    if (!input.isTerrain()) {
      return;
    }
    const point = newPosition.clone();
    console.log(`Drag start from ${point} / ${input}`);
    this._dragStart = point;
    this._lastPoint = point.clone();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processDragMove(input: UserInput, newPosition: Point): void {
    if (!input.isTerrain()) {
      return;
    }
    if (!this._lastPoint || !this._dragStart) {
      return;
    }
    const point = newPosition.clone();
    const diffX = point.x - this._lastPoint.x;
    const diffY = point.y - this._lastPoint.y;

    const gameService = Container.get<GameService>(GameService);
    console.debug(`drag progress ${this._dragStart} => ${point}`);
    this._lastPoint = point;
    gameService.moveBattleStage(diffX, diffY);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processDragEnd(input: UserInput, newPosition: Point): void {
    if (!input.isTerrain()) {
      return;
    }
    console.log(`Drag end`);
    this._dragStart = null;
    this._lastPoint = null;
  }
}
