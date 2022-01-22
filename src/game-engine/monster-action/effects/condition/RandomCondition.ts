import Monster from "@/game-engine/monster/Monster";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import Ability from "../../ability/Ability";
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
    return out;
  }
  public toJson(): any {
    const out: any = {};
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
  public summary(): string {
    return `with a ${this.threshold * 100}% probability`;
  }
  protected doValidate(): void {
    if (this.threshold < 0 || this.threshold > 1) {
      throw Error(
        `Threshold of random condition out of range: ${this.threshold * 100}`
      );
    }
  }
}
