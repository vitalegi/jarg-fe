import Monster from "@/game-engine/monster/Monster";
import Container, { Service } from "typedi";
import StatsService from "./stats/StatsService";

@Service()
export class LevelUpService {
  protected statsService = Container.get<StatsService>(StatsService);

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
    if (this.canLevelUp(monster, exp)) {
      await this.levelUp(monster);
      if (exp - toNextLevel > 0) {
        await this.gainExperience(monster, exp - toNextLevel);
      }
    } else {
      monster.experience += exp;
      monster.currentLevelExperience += exp;
    }
  }

  public canLevelUp(monster: Monster, exp: number): boolean {
    return exp >= this.toNextLevel(monster);
  }

  public async levelUps(
    monster: Monster,
    toLevel: number,
    restoreHP = false
  ): Promise<void> {
    while (monster.level < toLevel) {
      await this.levelUp(monster, restoreHP);
    }
  }

  public async levelUp(monster: Monster, restoreHP = false): Promise<void> {
    const toNextLevel = this.toNextLevel(monster);
    monster.experience += toNextLevel;
    monster.currentLevelExperience = 0;
    monster.level += 1;
    this.statsService.updateMonsterAttributes(monster, restoreHP);

    console.log(
      `${monster.uuid} performs level up. New level ${
        monster.level
      }, new stats: ${monster.stats.toString()}`
    );
  }

  public toNextLevel(monster: Monster): number {
    const levelExp = this.getNextLevelExp(monster.level);
    return levelExp - monster.currentLevelExperience;
  }
}
