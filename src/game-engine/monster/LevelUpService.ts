import { Monster } from "@/models/Character";
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
    const levelExp = this.getNextLevelExp(monster.level);
    const toNextLevel = levelExp - monster.currentLevelExperience;
    console.log(
      `Monster ${monster.uuid} gains ${exp} EXP. Level EXP: ${monster.currentLevelExperience}, required: ${levelExp}, to next level: ${toNextLevel}.`
    );
    if (monster.currentLevelExperience + exp < levelExp) {
      monster.experience += exp;
      monster.currentLevelExperience += exp;
      return;
    }
    monster.experience += toNextLevel;
    monster.currentLevelExperience = 0;
    await this.levelUp(monster);
    if (exp - toNextLevel > 0) {
      await this.gainExperience(monster, exp - toNextLevel);
    }
  }

  protected async levelUp(monster: Monster): Promise<void> {
    console.log(`Monster ${monster.uuid} performs level-up`);
    monster.currentLevelExperience = 0;
    monster.level += 1;
    this.computeAttributes(monster);

    console.log(
      `Level up done (${monster.level}), new stats: ${monster.stats.toString()}`
    );
  }

  protected computeAttributes(monster: Monster): void {
    const getValue = (stat: (s: Stats) => number): number => {
      return this.getAttributeValue(
        monster.level,
        stat(monster.baseStats),
        stat(monster.growthRates)
      );
    };
    monster.stats.maxHP = getValue((s) => s.maxHP);
    monster.stats.atk = getValue((s) => s.atk);
    monster.stats.def = getValue((s) => s.def);
    monster.stats.int = getValue((s) => s.int);
    monster.stats.res = getValue((s) => s.res);
    monster.stats.dex = getValue((s) => s.dex);
    monster.stats.hit = getValue((s) => s.hit);
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
