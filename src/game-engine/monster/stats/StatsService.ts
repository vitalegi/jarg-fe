import ComputedEffect from "@/game-engine/monster-action/computed-effect/ComputedEffect";
import ComputedEffectUtil from "@/game-engine/monster-action/computed-effect/ComputedEffectUtil";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";
import Monster from "../Monster";
import StatusService from "../status/StatusService";
import Stats from "./Stats";
import StatsConstants from "./StatsContants";

@Service()
export default class StatsService {
  protected logger = LoggerFactory.getLogger(
    "GameEngine.Monster.Stats.StatsService"
  );
  protected statusService = Container.get<StatusService>(StatusService);

  public isStat(stat: string): boolean {
    return StatsConstants.COLLECTION.indexOf(stat) !== -1;
  }

  public isHp(stat: string): boolean {
    return StatsConstants.HP === stat;
  }
  public isMaxHp(stat: string): boolean {
    return StatsConstants.MAX_HP === stat;
  }
  public isAtk(stat: string): boolean {
    return StatsConstants.ATK === stat;
  }
  public isDef(stat: string): boolean {
    return StatsConstants.DEF === stat;
  }
  public isInt(stat: string): boolean {
    return StatsConstants.INT === stat;
  }
  public isRes(stat: string): boolean {
    return StatsConstants.RES === stat;
  }
  public isHit(stat: string): boolean {
    return StatsConstants.HIT === stat;
  }
  public isDex(stat: string): boolean {
    return StatsConstants.DEX === stat;
  }
  public isSpeed(stat: string): boolean {
    return StatsConstants.SPEED === stat;
  }

  public getStat(stats: Stats, stat: string): number {
    if (this.isHp(stat)) {
      return stats.hp;
    }
    if (this.isMaxHp(stat)) {
      return stats.maxHP;
    }
    if (this.isAtk(stat)) {
      return stats.atk;
    }
    if (this.isDef(stat)) {
      return stats.def;
    }
    if (this.isInt(stat)) {
      return stats.int;
    }
    if (this.isRes(stat)) {
      return stats.res;
    }
    if (this.isHit(stat)) {
      return stats.hit;
    }
    if (this.isDex(stat)) {
      return stats.dex;
    }
    if (this.isSpeed(stat)) {
      return stats.speed;
    }
    throw Error(`Unknown stat ${stat}`);
  }

  public setStat(stats: Stats, stat: string, value: number): void {
    if (this.isHp(stat)) {
      stats.hp = value;
      return;
    }
    if (this.isMaxHp(stat)) {
      stats.maxHP = value;
      return;
    }
    if (this.isAtk(stat)) {
      stats.atk = value;
      return;
    }
    if (this.isDef(stat)) {
      stats.def = value;
      return;
    }
    if (this.isInt(stat)) {
      stats.int = value;
      return;
    }
    if (this.isRes(stat)) {
      stats.res = value;
      return;
    }
    if (this.isHit(stat)) {
      stats.hit = value;
      return;
    }
    if (this.isDex(stat)) {
      stats.dex = value;
      return;
    }
    if (this.isSpeed(stat)) {
      stats.speed = value;
      return;
    }
    throw Error(`Unknown stat ${stat}`);
  }

  public updateMonsterAttributes(monster: Monster, restoreHP: boolean): void {
    const oldHP = monster.stats.hp;
    const stats = this.getAttributesByLevel(
      monster.level,
      monster.baseStats,
      monster.growthRates
    );
    if (restoreHP) {
      stats.hp = stats.maxHP;
    } else {
      stats.hp = oldHP;
    }
    const speedBonus = this.statusService.getSpeedBonus(monster);
    this.logger.info(
      `Speed bonus of ${monster.uuid} ${monster.name}: ${speedBonus}`
    );

    monster.stats = this.getStatsWithAlterations(
      stats,
      monster.activeEffects,
      speedBonus
    );
  }

  public getAttributesByLevel(
    level: number,
    baseStats: Stats,
    growthRates: Stats
  ): Stats {
    const stats = new Stats();
    const getValue = (stat: (s: Stats) => number): number => {
      return this.getAttributeValue(level, stat(baseStats), stat(growthRates));
    };
    stats.maxHP = getValue((s) => s.maxHP);
    stats.hp = getValue((s) => s.hp);
    stats.atk = getValue((s) => s.atk);
    stats.def = getValue((s) => s.def);
    stats.int = getValue((s) => s.int);
    stats.res = getValue((s) => s.res);
    stats.dex = getValue((s) => s.dex);
    stats.hit = getValue((s) => s.hit);
    stats.speed = getValue((s) => s.speed);
    return stats;
  }

  protected getAttributeValue(
    level: number,
    baseValue: number,
    growthRate: number
  ): number {
    const rate = growthRate / 100;
    return Math.round(baseValue * rate * level);
  }

  protected getStatsWithAlterations(
    stats: Stats,
    activeEffects: ComputedEffect[],
    speedBonus: number
  ): Stats {
    const alteredStats = stats.clone();
    StatsConstants.COLLECTION.forEach((stat) => {
      const newValue = this.getStatWithAlterations(stats, stat, activeEffects);
      this.setStat(alteredStats, stat, newValue);
    });
    alteredStats.speed = Math.ceil(speedBonus * alteredStats.speed);
    return alteredStats;
  }

  protected getStatWithAlterations(
    stats: Stats,
    stat: string,
    activeEffects: ComputedEffect[]
  ): number {
    const sumPercentages = ComputedEffectUtil.getStatChanges(activeEffects)
      .filter((a) => a.stat === stat)
      .map((a) => a.percentage)
      .reduce((prev, curr) => prev + curr, 0);

    const curr = this.getStat(stats, stat);
    const newValue = Math.round(curr * (1 + sumPercentages));
    if (this.isHp(stat)) {
      return newValue;
    }
    return Math.max(1, newValue);
  }
}
