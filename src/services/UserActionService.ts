import { Service } from "typedi";
import * as PIXI from "pixi.js";
import { InteractionEvent } from "pixi.js";
import Point from "@/models/Point";
import ActionHandler from "@/game-engine/action-handler/ActionHandler";
import WalkActionHandler from "@/game-engine/action-handler/WalkActionHandler";
import UserInput from "@/game-engine/action-handler/UserInput";

@Service()
export default class UserActionService {
  protected actionHandler: null | ActionHandler = null;

  public setActionHandler(actionHandler: ActionHandler | null) {
    this.actionHandler = actionHandler;
  }

  public initMonster(uuid: string, sprite: PIXI.Sprite): void {
    sprite.interactive = true;
    sprite.on("pointertap", (e: InteractionEvent) => this.tapMonster(uuid));
  }
  public initMapTile(position: Point, sprite: PIXI.Sprite): void {
    sprite.interactive = true;
    sprite.on("pointertap", (e: InteractionEvent) => this.tapTile(position));
  }

  public tapMonster(uuid: string): void {
    console.log(`tap monster ${uuid}`);
    const input = UserInput.monsterInput(uuid);
    if (this.actionHandler === null) {
      this.actionHandler = new WalkActionHandler(uuid);
      this.actionHandler.start(input);
    } else {
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
