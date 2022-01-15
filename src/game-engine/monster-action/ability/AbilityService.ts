import Monster from "@/game-engine/monster/Monster";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";
import AbilityLearnable from "./AbilityLearnable";
import AbilityLearned from "./AbilityLearned";

@Service()
export default class AbilityService {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.Ability.AbilityService"
  );

  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);

  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );

  public getNewLearnableAbilities(monster: Monster): AbilityLearnable[] {
    const monsterIndex = this.monsterIndexRepository.getMonster(
      monster.modelId
    );
    this.logger.info(``);
    const allLearnable = monsterIndex.learnableAbilities;
    const learnable = allLearnable.filter((a) =>
      this.canLearn(monster.level, a)
    );
    const notLearned = learnable.filter(
      (a) => !this.isAbilityLearned(monster, a.abilityId)
    );
    this.logger.info(
      `Monster ${monsterIndex.name} (${monsterIndex.monsterId}) at level ${monster.level} can learn ${learnable.length} skills (${allLearnable.length} total). Of these, it doesn't know ${notLearned.length} skills`
    );
    return notLearned;
  }

  public canLearn(level: number, learnable: AbilityLearnable): boolean {
    if (learnable.type !== AbilityLearnable.BY_LEVEL) {
      return false;
    }
    return level >= learnable.level;
  }

  public learnAbility(monster: Monster, abilityId: string): void {
    if (this.isAbilityLearned(monster, abilityId)) {
      this.logger.info(`Ability ${abilityId} already learned, skip.`);
      return;
    }
    const learned = new AbilityLearned();
    learned.abilityId = abilityId;
    const ability = this.abilityRepository.getAbility(abilityId);
    learned.maxUsages = ability.usages.current;
    learned.currentUsages = ability.usages.current;
    monster.abilities.push(learned);
    this.logger.info(
      `Monster ${monster.name} (${monster.uuid}) learns skill ${abilityId}`
    );
  }

  public isAbilityLearned(monster: Monster, abilityId: string): boolean {
    return monster.abilities.findIndex((a) => a.abilityId === abilityId) !== -1;
  }
}
