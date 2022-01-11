import Monster from "@/game-engine/monster/Monster";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import Ability from "../../Ability";
import Condition from "./Condition";

export default class RandomCondition extends Condition {
  public static KEY = "RANDOM";

  protected randomService = Container.get<RandomService>(RandomService);

  threshold;

  public constructor(threshold = 0) {
    super();
    this.threshold = threshold;
    this.type = RandomCondition.KEY;
  }

  public clone(): Condition {
    const out = new RandomCondition(this.threshold);
    out.id = this.id;
    return out;
  }
  public toJson(): any {
    const out: any = {};
    out.id = this.id;
    out.type = this.type;
    out.threshold = this.threshold;
    return out;
  }

  public getName(): string {
    return "RandomCondition";
  }

  public toString(): string {
    return `${this.getName()} threshold=${this.threshold}`;
  }

  public accept(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): boolean {
    return this.randomService.randomDecimal(0, 1) <= this.threshold;
  }
}
