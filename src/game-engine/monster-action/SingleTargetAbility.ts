import Monster from "@/game-engine/monster/Monster";
import RandomService from "@/services/RandomService";
import Container from "typedi";
import MonsterIndexService from "../monster/MonsterIndexService";
import TypeService from "../types/TypeService";
import Ability from "./Ability";
import Effect from "./effects/Effect";
import HpDamageEffect from "./effects/HpDamageEffect";
import TargetType from "./effects/target/TargetType";

export default class SingleTargetAbility {
  protected typeService = Container.get<TypeService>(TypeService);
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected source: Monster;
  protected target: Monster;
  protected ability: Ability;

  public constructor(source: Monster, target: Monster, ability: Ability) {
    this.source = source;
    this.target = target;
    this.ability = ability;
  }

  public execute(): Effect[] {
    const effect = new HpDamageEffect();
    effect.target.type = TargetType.TARGET;
    effect.damage = this.computeDamage();
    return [effect];
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
    const atkModifier = this.attackBonus();
    const attacker = (power / 100) * (atk / 3) * atkRandom * atkModifier;

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

  protected attackBonus(): number {
    const ability = this.ability.types;
    const source = this.monsterIndexService.getMonster(this.source.modelId);
    const target = this.monsterIndexService.getMonster(this.target.modelId);
    let bonus = 1;

    // synergy between attacker and ability
    ability.forEach((type, index) => {
      if (source.types.indexOf(type) !== -1) {
        bonus *= 1.2 / (index + 1);
      }
    });
    // bonus between ability and target
    ability.forEach((abilityType, index) => {
      target.types.forEach((targetType) => {
        bonus *=
          this.typeService.getBonus(abilityType, targetType) / (1 + index);
      });
    });
    return bonus;
  }
}
