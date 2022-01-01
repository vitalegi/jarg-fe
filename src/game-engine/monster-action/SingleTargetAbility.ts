import { Monster } from "@/models/Character";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import Ability from "./Ability";
import AbilityEffect, { StatAbilityEffect } from "./AbilityEffect";

export default class SingleTargetAbility {
  protected source: Monster;
  protected target: Monster;
  protected ability: Ability;

  public constructor(source: Monster, target: Monster, ability: Ability) {
    this.source = source;
    this.target = target;
    this.ability = ability;
  }

  public execute(): AbilityEffect[] {
    const damage = this.computeDamage();
    return [new StatAbilityEffect("hp", "abs", -damage)];
  }

  public hit(): boolean {
    const randomService = this.randomService();

    const accuracy = this.ability.precision;
    const hit = this.source.stats.hit;
    const hitRandom = randomService.randomDecimal(0.8, 1.2);

    const attacker = (accuracy / 100) * hit * hitRandom;

    const dex = this.target.stats.dex;
    const dexRandom = randomService.randomDecimal(0.6, 1);
    const defender = dex * dexRandom;

    const match = attacker >= dex;

    console.log(
      `accuracy: ${accuracy}, HIT: ${hit}, random: ${hitRandom} => ${attacker}, DEX: ${dex}, random: ${dexRandom} => ${defender}. HIT: ${match}`
    );
    return match;
  }

  protected computeDamage(): number {
    const randomService = this.randomService();

    const power = this.ability.power;

    let atk = this.source.stats.atk;
    // TODO move to constants file
    if (this.ability.atkStat === "int") {
      atk = this.source.stats.int;
    }
    const atkRandom = randomService.randomDecimal(0.9, 1.1);
    // TODO add hit bonus
    const atkModifier = 0;
    const attacker = (power / 100) * (atk / 3) * atkRandom * (1 + atkModifier);

    let def = this.target.stats.def;
    // TODO move to constants file
    if (this.ability.defStat === "res") {
      def = this.target.stats.res;
    }
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
