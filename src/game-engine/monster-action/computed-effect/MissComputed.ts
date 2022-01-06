import Monster from "@/game-engine/monster/Monster";
import ComputedEffect from "./ComputedEffect";

export default class MissComputed extends ComputedEffect {
  target;
  public constructor(target: Monster) {
    super();
    this.target = target;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async render(): Promise<void> {
    console.log(`BATTLE MissComputed: miss attack to ${this.target.name}`);
    return super.showTextOverMonster(this.target, "MISS");
  }
}
