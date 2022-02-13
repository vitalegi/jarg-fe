import TargetType from "@/game-engine/ability/effects/target/TargetType";
import Monster from "@/game-engine/monster/Monster";
import { asString } from "@/utils/JsonUtil";

export default class Target {
  type = TargetType.TARGET;

  public static fromJson(json: any): Target {
    const out = new Target();
    out.type = asString(json.type);
    return out;
  }

  public clone(): Target {
    const out = new Target();
    out.type = this.type;
    return out;
  }

  public toJson(): any {
    const out: any = {};
    out.type = this.type;
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

  public validate(): void {
    if (this.type === TargetType.SELF) {
      return;
    }
    if (this.type === TargetType.TARGET) {
      return;
    }
    throw Error(`Invalid target ${this.type}`);
  }
}
