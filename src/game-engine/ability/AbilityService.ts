import Ability from "@/game-engine/model/ability/Ability";
import AbilityLearnable from "@/game-engine/model/ability/AbilityLearnable";
import AbilityLearned from "@/game-engine/model/ability/AbilityLearned";
import Monster from "@/game-engine/model/monster/Monster";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import LoggerFactory from "@/logger/LoggerFactory";
import Container, { Service } from "typedi";

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

  public getAbility(abilityId: string): Ability {
    return this.abilityRepository.getAbility(abilityId);
  }

  // TODO if the monster evolves, with this method it will learn also all the abilities of the evolution, not just the new abilities
  public getNewLearnableAbilities(monster: Monster): AbilityLearnable[] {
    const monsterIndex = this.monsterIndexRepository.getMonster(
      monster.modelId
    );
    const allLearnable = monsterIndex.learnableAbilities;
    const learnable = allLearnable.filter((a) =>
      this.canLearn(monster.level, a)
    );
    this.logger.debug(
      `Monster ${monsterIndex.name} (${monsterIndex.monsterId}) at level ${monster.level} can learn ${learnable} abilities.`
    );
    const notLearned = learnable.filter(
      (a) => !this.isAbilityLearned(monster, a.abilityId)
    );
    this.logger.debug(
      `${notLearned.length} new abilities for ${monsterIndex.name} (${
        monsterIndex.monsterId
      }) at level ${monster.level}: ${notLearned
        .map((a) => a.abilityId)
        .join(", ")}`
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
      this.logger.debug(`Ability ${abilityId} already learned, skip.`);
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
