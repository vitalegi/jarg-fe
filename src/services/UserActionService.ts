import Container, { Service } from "typedi";
import * as PIXI from "pixi.js";
import { InteractionEvent } from "pixi.js";
import Point from "@/models/Point";
import UserActionHandler from "@/game-engine/user-action-handler/UserActionHandler";
import UserInput from "@/game-engine/user-action-handler/UserInput";
import DragScreenHandler from "@/game-engine/DragScreenHandler";

@Service()
export default class UserActionService {
  protected actionHandler: null | UserActionHandler = null;
  protected dragScreenHandler =
    Container.get<DragScreenHandler>(DragScreenHandler);

  public setActionHandler(actionHandler: UserActionHandler | null): void {
    this.actionHandler = actionHandler;
  }

  public initMonster(uuid: string, sprite: PIXI.Container): void {
    sprite.interactive = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sprite.on("pointertap", (e: InteractionEvent) => this.tapMonster(uuid));
  }
  public initMapTile(position: Point, sprite: PIXI.Sprite): void {
    sprite.interactive = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sprite.on("pointertap", (e: InteractionEvent) => this.tapTile(position));
    this.dragScreenHandler.addListener(sprite);
  }

  public tapMonster(uuid: string): void {
    console.log(`tap monster ${uuid}`);
    const input = UserInput.monsterInput(uuid);
    if (this.actionHandler !== null) {
      this.actionHandler.process(input);
    }
  }

  public tapTile(position: Point): void {
    console.log(`tap tile (${position.x}, ${position.y})`);
    const input = UserInput.terrainInput(position);
    if (this.actionHandler !== null) {
      this.actionHandler.process(input);
    }
  }
}
