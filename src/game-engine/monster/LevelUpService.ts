import FormulaService from "@/game-engine/FormulaService";
import Monster from "@/game-engine/model/monster/Monster";
import StatsService from "@/game-engine/monster/stats/StatsService";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";

@Service()
export class LevelUpService {
  logger = LoggerFactory.getLogger("GameEngine.Monster.LevelUpService");
  protected statsService = Container.get(StatsService);
  protected formulaService = Container.get(FormulaService);

  public async gainExperience(monster: Monster, exp: number): Promise<void> {
    const toNextLevel = this.toNextLevel(monster);
    this.logger.info(
      `Monster ${monster.uuid} gains ${exp} EXP. Level EXP: ${monster.currentLevelExperience}, to next level: ${toNextLevel}.`
    );
    if (this.canLevelUp(monster, exp)) {
      this.logger.info(`${monster.uuid} performs level up.`);
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
    this.logger.info(`${monster.uuid} levels up to level ${toLevel}.`);
    while (monster.level < toLevel) {
      await this.levelUp(monster, restoreHP);
    }
  }

  public toNextLevel(monster: Monster): number {
    const levelExp = this.formulaService.getNextLevelExp(monster.level);
    return levelExp - monster.currentLevelExperience;
  }

  private async levelUp(monster: Monster, restoreHP = false): Promise<void> {
    const toNextLevel = this.toNextLevel(monster);
    monster.experience += toNextLevel;
    monster.currentLevelExperience = 0;
    monster.level += 1;
    this.statsService.updateMonsterAttributes(monster, restoreHP);
  }
}
