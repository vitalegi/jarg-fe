import Point from "@/models/Point";
import UserActionHandler from "./UserActionHandler";
import UserInput from "./UserInput";

export default class SelectTargetUserActionHandler extends UserActionHandler {
  protected skipUUID = "";
  protected allowTerrains = false;
  protected allowMonsters = false;

  public constructor(
    skipUUID: string,
    allowTerrains: boolean,
    allowMonsters: boolean
  ) {
    super();
    this.skipUUID = skipUUID;
    this.allowTerrains = allowTerrains;
    this.allowMonsters = allowMonsters;
  }

  process(input: UserInput): void {
    if (input.isTerrain() && this.acceptTerrain(input.getPosition())) {
      this.done(input);
    }
    if (input.isMonster() && this.acceptMonster(input.getMonsterId())) {
      this.done(input);
    }
  }

  protected acceptTerrain(point: Point): boolean {
    return this.allowTerrains;
  }
  protected acceptMonster(uuid: string): boolean {
    if (!this.allowMonsters) {
      return false;
    }
    if (this.skipUUID === uuid) {
      return false;
    }
    return true;
  }
}
