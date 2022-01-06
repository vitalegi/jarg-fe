import Monster from "@/game-engine/monster/Monster";
import ComputedEffect from "./ComputedEffect";

export default class HpDamageComputed extends ComputedEffect {
  target;
  damage;

  public constructor(target: Monster, damage: number) {
    super();
    this.target = target;
    this.damage = damage;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async render(): Promise<void> {
    return super.showTextOverMonster(this.target, "TODO");
  }
  public applyAfterRender(): void {
    console.log(
      `BATTLE HpDamageComputed: ${this.damage} HP damage to ${this.target.name}`
    );
    this.target.stats.hp -= this.damage;
  }
}
