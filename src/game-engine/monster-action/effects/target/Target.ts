import Monster from "@/game-engine/monster/Monster";
import TargetType from "./TargetType";

export default class Target {
  type = TargetType.TARGET;

  public static fromJson(json: any): Target {
    const out = new Target();
    out.type = json.type;
    return out;
  }

  public getTarget(source: Monster, target: Monster): Monster {
    if (this.type === TargetType.SELF) {
      return source;
    }
    if (this.type === TargetType.TARGET) {
      return target;
    }
    throw Error(`Unknown type ${this.type}`);
  }
}
