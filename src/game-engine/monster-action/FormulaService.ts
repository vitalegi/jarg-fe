import LoggerFactory from "@/logger/LoggerFactory";
import RandomService from "@/services/RandomService";
import Container, { Service } from "typedi";
import Monster from "../monster/Monster";
import MonsterIndex from "../monster/MonsterIndex";
import MonsterIndexService from "../monster/MonsterIndexService";
import Stats from "../monster/stats/Stats";
import StatsService from "../monster/stats/StatsService";
import TypeService from "../types/TypeService";
import Ability from "./ability/Ability";
import StatusChangeComputed from "./computed-effect/StatusChangeComputed";

@Service()
export default class FormulaService {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.FormulaService");
  protected randomService = Container.get<RandomService>(RandomService);
  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected typeService = Container.get<TypeService>(TypeService);
  protected statsService = Container.get<StatsService>(StatsService);

  public hit(source: Monster, target: Monster, ability: Ability): boolean {
    return this.doHit(source.stats, target.stats, ability.precision);
  }

  public doHit(source: Stats, target: Stats, accuracy: number): boolean {
    const hit = source.hit;
    const hitRandom = this.randomService.randomDecimal(0.7, 1.3);

    const attacker = (accuracy / 100) * hit * hitRandom;

    const dex = target.dex;
    const dexRandom = this.randomService.randomDecimal(0.3, 0.8);
    const defender = dex * dexRandom;

    const match = attacker / defender >= 0.6;

    this.logger.debug(
      `accuracy: ${accuracy}, HIT: ${hit}, random: ${hitRandom} => ${attacker}, DEX: ${dex}, random: ${dexRandom} => ${defender}. HIT: ${match}`
    );
    return match;
  }

  public damage(source: Monster, target: Monster, ability: Ability): number {
    const atk = this.getAtk(source.stats, ability.atkStat);
    const def = this.getDef(target.stats, ability.defStat);

    const sourceModel = this.monsterIndexService.getMonster(source.modelId);
    const targetModel = this.monsterIndexService.getMonster(target.modelId);

    return this.doDamage(
      sourceModel,
      targetModel,
      atk,
      def,
      ability.power,
      ability.types
    );
  }

  public doDamage(
    sourceModel: MonsterIndex,
    targetModel: MonsterIndex,
    atk: number,
    def: number,
    abilityPower: number,
    abilityTypes: string[]
  ): number {
    const atkRandom = this.randomService.randomDecimal(0.9, 1.1);
    // TODO add hit bonus
    const atkModifier = this.attackBonus(
      sourceModel,
      targetModel,
      abilityTypes
    );
    const abilityPowerBonus = 0.5 + abilityPower / 100;
    const attacker = abilityPowerBonus * (atk / 3) * atkRandom * atkModifier;

    const defRandom = this.randomService.randomDecimal(0.45, 0.6);
    const defModifier = 0;
    const defender = (def / 3) * defRandom * (1 + defModifier);

    const damage = Math.max(Math.round(attacker - defender), 0);
    this.logger.debug(
      `power: ${abilityPower}, ATK: ${atk}, random: ${atkRandom}, atkModifier: ${atkModifier} => ${attacker}, DEF: ${def}, random: ${defRandom}, defModifier: ${defModifier} => ${defender}. Damage: ${damage}`
    );
    return damage;
  }

  public getAtk(source: Stats, atkStat: string | null): number {
    if (atkStat === null) {
      return 0;
    }
    if (this.statsService.isInt(atkStat)) {
      return source.int;
    }
    if (this.statsService.isAtk(atkStat)) {
      return source.atk;
    }
    throw Error(`Unknown attacker stat ${atkStat}`);
  }

  public getDef(source: Stats, defStat: string | null): number {
    if (defStat === null) {
      return 0;
    }
    if (this.statsService.isDef(defStat)) {
      return source.def;
    }
    if (this.statsService.isRes(defStat)) {
      return source.res;
    }
    throw Error(`Unknown defensive stat ${defStat}`);
  }

  protected attackBonus(
    source: MonsterIndex,
    target: MonsterIndex,
    abilityTypes: string[]
  ): number {
    let bonus = 1;

    // synergy between attacker and ability
    abilityTypes.forEach((type, index) => {
      if (source.types.indexOf(type) !== -1) {
        bonus *= 1.2 / (index + 1);
      }
    });
    this.logger.debug(
      `Source synergy ${bonus}: ability types ${abilityTypes} and source types ${source.types}`
    );
    // bonus between ability and target
    abilityTypes.forEach((abilityType, index) => {
      target.types.forEach((targetType) => {
        const bonus2 = this.typeService.getBonus(abilityType, targetType);
        bonus *= bonus2 / (1 + index);
        this.logger.debug(
          `Target bonus of ${abilityType} vs ${targetType}: ${bonus2}, total: ${bonus}`
        );
      });
    });
    return bonus;
  }

  public catch(target: Monster): boolean {
    const baseRate = this.catchBaseSuccessRate(target);
    const alteredStatuses = target.activeEffects.filter(
      (e) => e.type === StatusChangeComputed.TYPE
    );
    let rate = baseRate;
    if (alteredStatuses.length > 0) {
      rate *= 1.3;
    }
    this.logger.debug(
      `Catch ${target.uuid} with baseRate ${baseRate} and ${alteredStatuses.length} altered statuses. Rate: ${rate}`
    );
    return this.randomService.randomBool(rate);
  }

  protected catchBaseSuccessRate(target: Monster): number {
    const ratio = (100.0 * target.stats.hp) / target.stats.maxHP;
    const PAIRS = [
      { minRatio: 99, probability: 0 },
      { minRatio: 90, probability: 0.01 },
      { minRatio: 80, probability: 0.02 },
      { minRatio: 70, probability: 0.03 },
      { minRatio: 60, probability: 0.04 },
      { minRatio: 50, probability: 0.1 },
      { minRatio: 40, probability: 0.2 },
      { minRatio: 30, probability: 0.15 },
      { minRatio: 20, probability: 0.25 },
      { minRatio: 15, probability: 0.5 },
      { minRatio: 10, probability: 0.6 },
      { minRatio: 5, probability: 0.7 },
      { minRatio: 1, probability: 0.8 },
      { minRatio: 0, probability: 0.9 },
    ];
    for (const par of PAIRS) {
      if (par.minRatio <= ratio) {
        return par.probability;
      }
    }
    return PAIRS[PAIRS.length - 1].probability;
  }
}
