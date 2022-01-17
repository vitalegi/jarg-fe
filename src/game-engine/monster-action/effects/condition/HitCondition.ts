import Monster from "@/game-engine/monster/Monster";
import Ability from "../../ability/Ability";
import Condition from "./Condition";

export default class HitCondition extends Condition {
  public static KEY = "HIT";

  public constructor() {
    super();
    this.type = HitCondition.KEY;
  }

  public clone(): Condition {
    const out = new HitCondition();
    return out;
  }
  public toJson(): any {
    const out: any = {};
    out.type = this.type;
    return out;
  }

  public getName(): string {
    return "HitCondition";
  }

  public toString(): string {
    return `${this.getName()}`;
  }

  public accept(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): boolean {
    return hit;
  }
  public summary(): string {
    return "if attack hits";
  }
}
