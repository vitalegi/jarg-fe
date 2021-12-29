import { Monster } from "@/models/Character";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import AbilityEffect, { StatAbilityEffect } from "./AbilityEffect";

export default class SingleTargetAbility {
  protected source: Monster;
  protected target: Monster;

  public constructor(source: Monster, target: Monster) {
    this.source = source;
    this.target = target;
  }

  public execute(): AbilityEffect[] {
    const damage = this.computeDamage();
    return [new StatAbilityEffect("hp", "abs", -damage)];
  }

  protected computeDamage(): number {
    const randomService = this.randomService();

    // TODO add power bonus
    const power = 100;
    const atk = this.source.stats.atk;
    const atkRandom = randomService.randomDecimal(0.9, 1.1);
    // TODO add hit bonus
    const atkModifier = 0;
    const attacker = (power / 100) * (atk / 3) * atkRandom * (1 + atkModifier);

    const def = this.target.stats.def;
    const defRandom = randomService.randomDecimal(0.45, 0.6);
    const defModifier = 0;
    const defender = (def / 3) * defRandom * (1 + defModifier);

    const damage = Math.max(Math.round(attacker - defender), 0);
    console.log(
      `power: ${power}, ATK: ${atk}, random: ${atkRandom}, atkModifier: ${atkModifier} => ${attacker}, DEF: ${def}, random: ${defRandom}, defModifier: ${defModifier} => ${defender}. Damage: ${damage}`
    );
    return damage;
  }

  protected randomService(): RandomService {
    return Container.get<RandomService>(RandomService);
  }
}
