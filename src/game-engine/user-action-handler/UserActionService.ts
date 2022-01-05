import { Service } from "typedi";
import * as PIXI from "pixi.js";
import Point from "@/models/Point";
import UserActionHandler from "@/game-engine/user-action-handler/UserActionHandler";
import UserInput from "@/game-engine/user-action-handler/UserInput";
import DetectEvent from "../ui/DetectEvent";

@Service()
export default class UserActionService {
  protected actionHandlers: UserActionHandler[] = [];

  public addActionHandler(actionHandler: UserActionHandler): void {
    this.actionHandlers.push(actionHandler);
    console.log(
      `Add ActionHandler ${actionHandler.getName()}_${actionHandler.getUuid()}, available: ${this.actionHandlers
        .map((h) => `${h.getName()}_${h.getUuid()}`)
        .join(", ")}`
    );
  }

  public removeAll(): void {
    console.log(`Remove all ActionHandlers`);
    this.actionHandlers = [];
  }

  public removeActionHandler(actionHandler: UserActionHandler): void {
    const index = this.actionHandlers.findIndex(
      (h) => h.getUuid() === actionHandler.getUuid()
    );
    if (index === -1) {
      throw Error(
        `ActionHandler ${actionHandler.getName()}_${actionHandler.getUuid()} not present.`
      );
    }
    const handler = this.actionHandlers[index];
    console.log(
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
      console.log(`No handler provided for ${action}(${input})`);
      return;
    }
    const handler = handlers[handlers.length - 1];
    if (handlers.length > 1) {
      console.log(
        `Multiple handlers for ${action}(${input}), choosen ${handler.getName()}_${handler.getUuid()}, available: ${handlers
          .map((h) => `${h.getName()}_${h.getUuid()}`)
          .join(", ")}`
      );
    }
    if (handler) {
      process(handler, input, newPosition);
    }
  }
}
