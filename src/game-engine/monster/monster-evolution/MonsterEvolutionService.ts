import AbilityService from "@/game-engine/monster-action/ability/AbilityService";
import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";
import MonsterIndexService from "../MonsterIndexService";
import StatsService from "../stats/StatsService";
import MonsterEvolution from "./MonsterEvolution";

@Service()
export default class MonsterEvolutionService {
  logger = LoggerFactory.getLogger(
    "GameEngine.Monster.MonsterEvolution.MonsterEvolutionService"
  );

  protected monsterIndexService =
    Container.get<MonsterIndexService>(MonsterIndexService);
  protected abilityService = Container.get<AbilityService>(AbilityService);
  protected statsService = Container.get<StatsService>(StatsService);

  public canEvolve(monster: Monster): boolean {
    return this.getAvailableEvolutions(monster).length > 0;
  }

  public getAvailableEvolutions(monster: Monster): MonsterEvolution[] {
    const monsterIndex = this.monsterIndexService.getMonster(monster.modelId);
    return monsterIndex.evolutions.filter((e) =>
      this.passCondition(monster, e)
    );
  }

  public evolve(monster: Monster, evolution: MonsterEvolution): void {
    const evolutionIndex = this.monsterIndexService.getMonster(
      evolution.evolutionId
    );
    // apply new monster stats
    monster.modelId = evolution.evolutionId;
    monster.baseStats = evolutionIndex.baseStats.clone();
    monster.growthRates = evolutionIndex.growthRates.clone();
    this.statsService.updateMonsterAttributes(monster, false);

    // learn evolution's abilities
    this.abilityService
      .getNewLearnableAbilities(monster)
      .forEach((ability) =>
        this.abilityService.learnAbility(monster, ability.abilityId)
      );
  }

  protected passCondition(
    monster: Monster,
    evolution: MonsterEvolution
  ): boolean {
    if (evolution.type === MonsterEvolution.LEVEL_TYPE) {
      return monster.level >= evolution.level;
    }
    return false;
  }
}
