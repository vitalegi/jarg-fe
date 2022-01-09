import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import Container from "typedi";
import GameApp from "../GameApp";
import UserActionHandler from "./UserActionHandler";
import UserInput from "./UserInput";

export default class DragScreenUserActionHandler extends UserActionHandler {
  logger = LoggerFactory.getLogger(
    "GameEngine.UserActionHandler.DragScreenUserActionHandler"
  );
  protected gameApp = Container.get<GameApp>(GameApp);
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
    this.logger.info(`Drag start from ${point} / ${input}`);
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

    this.logger.debug(`drag progress ${this._dragStart} => ${point}`);
    this._lastPoint = point;
    this.moveBattleStage(diffX, diffY);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public processDragEnd(input: UserInput, newPosition: Point): void {
    if (!input.isTerrain()) {
      return;
    }
    this.logger.debug(`Drag end`);
    this._dragStart = null;
    this._lastPoint = null;
  }

  protected moveBattleStage(offsetX: number, offsetY: number): void {
    const battleContainer = this.gameApp.getBattleContainer();
    if (battleContainer) {
      battleContainer.x += offsetX;
      battleContainer.y += offsetY;
    }
  }
}
