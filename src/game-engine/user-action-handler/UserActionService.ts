import { Service } from "typedi";
import * as PIXI from "pixi.js";
import Point from "@/models/Point";
import UserActionHandler from "@/game-engine/user-action-handler/UserActionHandler";
import UserInput from "@/game-engine/user-action-handler/UserInput";
import LoggerFactory from "@/logger/LoggerFactory";
import DetectEvent from "@/game-engine/ui/DetectEvent";

@Service()
export default class UserActionService {
  logger = LoggerFactory.getLogger(
    "GameEngine.UserActionHandler.UserActionService"
  );
  protected actionHandlers: UserActionHandler[] = [];

  public addActionHandler(actionHandler: UserActionHandler): void {
    this.actionHandlers.push(actionHandler);
    this.logger.debug(
      `Add ActionHandler ${actionHandler.getName()}_${actionHandler.getUuid()}, available: ${this.actionHandlers
        .map((h) => `${h.getName()}_${h.getUuid()}`)
        .join(", ")}`
    );
  }

  public removeAll(): void {
    this.logger.debug(`Remove all ActionHandlers`);
    this.actionHandlers = [];
  }

  public hasActionHandler(actionHandler: UserActionHandler): boolean {
    return this.findActionHandler(actionHandler) !== -1;
  }

  public removeActionHandler(actionHandler: UserActionHandler): void {
    const index = this.findActionHandler(actionHandler);
    if (index === -1) {
      throw Error(
        `ActionHandler ${actionHandler.getName()}_${actionHandler.getUuid()} not present.`
      );
    }
    const handler = this.actionHandlers[index];
    this.logger.debug(
      `Remove ActionHandler ${handler.getName()}_${handler.getUuid()}, available: ${this.actionHandlers
        .map((h) => `${h.getName()}_${h.getUuid()}`)
        .join(", ")}`
    );
    this.actionHandlers.splice(index, 1);
  }

  public initMonster(uuid: string, sprite: PIXI.Container): void {
    const userInput = UserInput.monsterInput(uuid);
    this.initListeners(sprite, userInput);
  }
  public initMapTile(position: Point, sprite: PIXI.Sprite): void {
    const userInput = UserInput.terrainInput(position);
    this.initListeners(sprite, userInput);
  }
  public initContainer(container: PIXI.Container): void {
    const userInput = UserInput.containerInput(container);
    this.initListeners(container, userInput);
  }
  protected initListeners(
    sprite: PIXI.DisplayObject,
    userInput: UserInput
  ): void {
    const event = new DetectEvent(sprite);
    event.onTap(() => this.tap(userInput));
    event.onDragStart((e) =>
      this.dragStart(userInput, new Point(e.data.global.x, e.data.global.y))
    );
    event.onDrag((e) =>
      this.dragMove(userInput, new Point(e.data.global.x, e.data.global.y))
    );
    event.onDragEnd((e) =>
      this.dragEnd(userInput, new Point(e.data.global.x, e.data.global.y))
    );
  }

  protected tap(input: UserInput): void {
    this.process(
      input,
      new Point(),
      "tap",
      (h) => h.acceptTap(),
      (h, i) => h.processTap(i)
    );
  }

  protected dragStart(input: UserInput, position: Point): void {
    this.process(
      input,
      position,
      "dragStart",
      (h, i, p) => h.acceptDrag(),
      (h, i, p) => h.processDragStart(i, p)
    );
  }

  protected dragMove(input: UserInput, position: Point): void {
    this.process(
      input,
      position,
      "dragMove",
      (h, i, p) => h.acceptDrag(),
      (h, i, p) => h.processDragMove(i, p)
    );
  }

  protected dragEnd(input: UserInput, position: Point): void {
    this.process(
      input,
      position,
      "dragEnd",
      (h, i, p) => h.acceptDrag(),
      (h, i, p) => h.processDragEnd(i, p)
    );
  }

  protected process(
    input: UserInput,
    newPosition: Point,
    action: string,
    accept: (
      handler: UserActionHandler,
      input: UserInput,
      newPosition: Point
    ) => boolean,
    process: (
      handler: UserActionHandler,
      input: UserInput,
      newPosition: Point
    ) => void
  ): void {
    const handlers = this.actionHandlers.filter((h) =>
      accept(h, input, newPosition)
    );
    if (handlers.length === 0) {
      this.logger.info(`No handler provided for ${action}(${input})`);
      return;
    }
    const handler = handlers[handlers.length - 1];
    if (handlers.length > 1) {
      this.logger.info(
        `Multiple handlers for ${action}(${input}), choosen ${handler.getName()}_${handler.getUuid()}, available: ${handlers
          .map((h) => `${h.getName()}_${h.getUuid()}`)
          .join(", ")}`
      );
    }
    if (handler) {
      process(handler, input, newPosition);
    }
  }
  protected findActionHandler(actionHandler: UserActionHandler): number {
    return this.actionHandlers.findIndex(
      (h) => h.getUuid() === actionHandler.getUuid()
    );
  }
}
