import { Monster } from "@/models/Character";
import ActionEffect, { StatActionEffect } from "./ActionEffect";

export default class SingleTargetAbility {
  protected source: Monster;
  protected target: Monster;

  public constructor(source: Monster, target: Monster) {
    this.source = source;
    this.target = target;
  }

  public execute(): ActionEffect[] {
    const damage = this.computeDamage();
    return [new StatActionEffect("hp", "abs", -damage)];
  }

  protected computeDamage(): number {
    const atk = this.source.stats.atk;
    const def = this.target.stats.def;
    const diff = atk - def;
    const damage = Math.max(diff, 1);
    console.log(`ATK: ${atk}, DEF: ${def}, damage: ${damage}`);
    return damage;
  }
}
