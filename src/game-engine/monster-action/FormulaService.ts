import LoggerFactory from "@/logger/LoggerFactory";
import RandomService from "@/services/RandomService";
import Container, { Service } from "typedi";
import Monster from "../monster/Monster";
import MonsterIndexService from "../monster/MonsterIndexService";
import StatsService from "../monster/stats/StatsService";
import TypeService from "../types/TypeService";
import Ability from "./Ability";

@Service()
export default class FormulaService {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.FormulaService");
  protected randomService = Container.get<RandomService>(RandomService);
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected typeService = Container.get<TypeService>(TypeService);
  protected statsService = Container.get<StatsService>(StatsService);

  public hit(source: Monster, target: Monster, ability: Ability): boolean {
    const accuracy = ability.precision;
    const hit = source.stats.hit;
    const hitRandom = this.randomService.randomDecimal(0.8, 1.2);

    const attacker = (accuracy / 100) * hit * hitRandom;

    const dex = target.stats.dex;
    const dexRandom = this.randomService.randomDecimal(0.6, 1);
    const defender = dex * dexRandom;

    const match = attacker >= dex;

    this.logger.debug(
      `accuracy: ${accuracy}, HIT: ${hit}, random: ${hitRandom} => ${attacker}, DEX: ${dex}, random: ${dexRandom} => ${defender}. HIT: ${match}`
    );
    return match;
  }

  public damage(source: Monster, target: Monster, ability: Ability): number {
    const power = ability.power;

    const atk = this.getAtk(source, ability.atkStat);
    const atkRandom = this.randomService.randomDecimal(0.9, 1.1);
    // TODO add hit bonus
    const atkModifier = this.attackBonus(source, target, ability);
    const attacker = (power / 100) * (atk / 3) * atkRandom * atkModifier;

    const def = this.getDef(target, ability.defStat);
    const defRandom = this.randomService.randomDecimal(0.45, 0.6);
    const defModifier = 0;
    const defender = (def / 3) * defRandom * (1 + defModifier);

    const damage = Math.max(Math.round(attacker - defender), 0);
    this.logger.debug(
      `power: ${power}, ATK: ${atk}, random: ${atkRandom}, atkModifier: ${atkModifier} => ${attacker}, DEF: ${def}, random: ${defRandom}, defModifier: ${defModifier} => ${defender}. Damage: ${damage}`
    );
    return damage;
  }

  protected getAtk(source: Monster, atkStat: string | null): number {
    if (atkStat === null) {
      return 0;
    }
    if (this.statsService.isInt(atkStat)) {
      return source.stats.int;
    }
    if (this.statsService.isAtk(atkStat)) {
      return source.stats.atk;
    }
    throw Error(`Unknown attacker stat ${atkStat}`);
  }

  protected getDef(source: Monster, defStat: string | null): number {
    if (defStat === null) {
      return 0;
    }
    if (this.statsService.isDef(defStat)) {
      return source.stats.def;
    }
    if (this.statsService.isRes(defStat)) {
      return source.stats.res;
    }
    throw Error(`Unknown defensive stat ${defStat}`);
  }

  protected attackBonus(
    source: Monster,
    target: Monster,
    ability: Ability
  ): number {
    const abilityTypes = ability.types;
    const sourceModel = this.monsterIndexService.getMonster(source.modelId);
    const targetModel = this.monsterIndexService.getMonster(target.modelId);
    let bonus = 1;

    // synergy between attacker and ability
    abilityTypes.forEach((type, index) => {
      if (sourceModel.types.indexOf(type) !== -1) {
        bonus *= 1.2 / (index + 1);
      }
    });
    // bonus between ability and target
    abilityTypes.forEach((abilityType, index) => {
      targetModel.types.forEach((targetType) => {
        bonus *=
          this.typeService.getBonus(abilityType, targetType) / (1 + index);
      });
    });
    return bonus;
  }
}
