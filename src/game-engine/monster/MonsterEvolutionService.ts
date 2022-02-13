import AbilityService from "@/game-engine/ability/AbilityService";
import Monster from "@/game-engine/monster/Monster";
import MonsterEvolution from "@/game-engine/model/monster/evolution/MonsterEvolution";
import MonsterIndexService from "@/game-engine/monster/MonsterIndexService";
import StatsService from "@/game-engine/monster/stats/StatsService";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";

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
    if (evolution.isByLevel()) {
      return monster.level >= evolution.level;
    }
    return false;
  }
}
