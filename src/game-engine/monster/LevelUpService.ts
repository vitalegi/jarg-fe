import Monster from "@/game-engine/monster/Monster";
import Stats from "@/models/Stats";
import { Service } from "typedi";

@Service()
export class LevelUpService {
  public getKillExperience(monster: Monster): number {
    return Math.round(this.getNextLevelExp(monster.level) / 5) + 1;
  }

  public getNextLevelExp(level: number): number {
    return Math.round(100 * Math.pow(1.1, level));
  }

  public async gainExperience(monster: Monster, exp: number): Promise<void> {
    const toNextLevel = this.toNextLevel(monster);
    console.log(
      `Monster ${monster.uuid} gains ${exp} EXP. Level EXP: ${monster.currentLevelExperience}, to next level: ${toNextLevel}.`
    );
    if (exp < toNextLevel) {
      monster.experience += exp;
      monster.currentLevelExperience += exp;
      return;
    }
    await this.levelUp(monster);
    if (exp - toNextLevel > 0) {
      await this.gainExperience(monster, exp - toNextLevel);
    }
  }

  public async levelUp(monster: Monster, restoreHP = false): Promise<void> {
    const toNextLevel = this.toNextLevel(monster);
    monster.experience += toNextLevel;
    monster.currentLevelExperience = 0;
    monster.level += 1;
    this.computeMonsterAttributes(monster, restoreHP);

    console.log(
      `${monster.uuid} performs level up. New level ${
        monster.level
      }, new stats: ${monster.stats.toString()}`
    );
  }

  protected toNextLevel(monster: Monster): number {
    const levelExp = this.getNextLevelExp(monster.level);
    return levelExp - monster.currentLevelExperience;
  }

  public computeMonsterAttributes(monster: Monster, restoreHP: boolean): void {
    const stats = this.computeAttributes(
      monster.level,
      monster.baseStats,
      monster.growthRates
    );
    if (restoreHP) {
      stats.hp = stats.maxHP;
    } else {
      stats.hp = monster.stats.hp;
    }
    monster.stats = stats;
  }

  public computeAttributes(
    level: number,
    baseStats: Stats,
    growthRates: Stats
  ): Stats {
    const stats = new Stats();
    const getValue = (stat: (s: Stats) => number): number => {
      return this.getAttributeValue(level, stat(baseStats), stat(growthRates));
    };
    stats.maxHP = getValue((s) => s.maxHP);
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
}
