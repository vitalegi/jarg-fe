import Condition from "@/game-engine/ability/effects/condition/Condition";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";

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

  protected doValidate(): void {
    return;
  }
}
