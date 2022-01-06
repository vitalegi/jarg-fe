import Monster from "@/game-engine/monster/Monster";
import Statistics from "../Statistics";
import ComputedEffect from "./ComputedEffect";

export default class StatChangeComputed extends ComputedEffect {
  target;
  stat;
  percentage;

  public constructor(target: Monster, stat: Statistics, percentage: number) {
    super();
    this.target = target;
    this.stat = stat;
    this.percentage = percentage;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async render(): Promise<void> {
    return super.showTextOverMonster(
      this.target,
      "TODO " + this.percentage + " " + this.stat
    );
  }
  public applyAfterRender(): void {
    console.log(
      `BATTLE StatChangeComputed: vary by ${this.percentage * 100}% ${
        this.stat
      } of ${this.target.name}`
    );
    // TODO apply effect
  }
}
