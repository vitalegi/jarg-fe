import Monster from "@/game-engine/monster/Monster";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import Ability from "../../Ability";
import Condition from "./Condition";

export default class RandomCondition extends Condition {
  public static KEY = "RANDOM";
  type = RandomCondition.KEY;

  protected randomService = Container.get<RandomService>(RandomService);

  threshold;

  public constructor(threshold = 0) {
    super();
    this.threshold = threshold;
  }

  public clone(): Condition {
    const out = new RandomCondition(this.threshold);
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
