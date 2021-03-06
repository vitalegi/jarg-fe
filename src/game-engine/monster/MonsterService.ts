import { CharacterType } from "@/models/Character";
import RandomService from "@/services/RandomService";
import RendererService from "@/game-engine/ui/RendererService";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import Point from "@/models/Point";
import Move from "@/models/Move";
import Monster from "@/game-engine/model/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import ObjectUtil from "@/utils/ObjectUtil";
import CoordinateService from "@/game-engine/CoordinateService";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import MonsterData from "@/game-engine/model/monster/MonsterData";
import AbilityLearned from "@/game-engine/model/ability/AbilityLearned";
import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import AbilityService from "@/game-engine/ability/AbilityService";
import ActionType from "@/game-engine/model/turn/ActionType";
import HistoryRepository from "@/game-engine/battle/turns/HistoryRepository";
import NAMES from "@/assets/names.json";

@Service()
export default class MonsterService {
  logger = LoggerFactory.getLogger("GameEngine.Monster.MonsterService");
  protected rendererService = Container.get(RendererService);
  protected userActionService = Container.get(UserActionService);
  protected coordinateService = Container.get(CoordinateService);
  protected monsterIndexRepository = Container.get(MonsterIndexRepository);
  protected abilityService = Container.get(AbilityService);
  protected levelUpService = Container.get(LevelUpService);
  protected historyRepository = Container.get(HistoryRepository);

  public async createExistingMonsters(data: MonsterData[]): Promise<Monster[]> {
    return await Promise.all(data.map((m) => this.createExistingMonster(m)));
  }

  public async createMonster(
    ownerId: string | null,
    monsterIndexId: string,
    name: string | null,
    level: number,
    catchable: boolean
  ): Promise<Monster> {
    const random = Container.get(RandomService);
    if (!name) {
      name = NAMES[random.randomInt(0, NAMES.length - 1)];
    }

    // TODO move to MonsterIndex
    const movements = new Move();
    movements.steps = 3;
    movements.canWalk = true;

    return this._createMonster(
      UuidUtil.nextId(),
      ownerId,
      monsterIndexId,
      name,
      level,
      null,
      null,
      [],
      [],
      movements,
      null,
      undefined,
      catchable
    );
  }

  protected async createExistingMonster(m: MonsterData): Promise<Monster> {
    try {
      return this._createMonster(
        m.uuid,
        m.ownerId,
        m.modelId,
        m.name,
        m.level,
        m.experience,
        m.currentLevelExperience,
        [],
        m.abilities,
        m.movements,
        m.hp,
        m.lastTimePlayed,
        false
      );
    } catch (e) {
      this.logger.error(`Can't process monster ${JSON.stringify(m)}: ${e}`);
      throw e;
    }
  }

  protected async _createMonster(
    uuid: string,
    ownerId: string | null,
    monsterIndexId: string,
    name: string,
    level: number,
    experience: number | null,
    currentLevelExperience: number | null,
    activeEffects: ComputedEffect[],
    abilities: AbilityLearned[],
    movement: Move,
    hp: number | null,
    lastTimePlayed: Date | undefined,
    catchable: boolean
  ): Promise<Monster> {
    const monster = new Monster();
    monster.uuid = uuid;
    const monsterIndex = this.monsterIndexRepository.getMonster(monsterIndexId);
    monster.modelId = monsterIndex.monsterId;
    monster.name = name;
    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;

    monster.baseStats = monsterIndex.baseStats.clone();
    monster.growthRates = monsterIndex.growthRates.clone();
    monster.lastTimePlayed = lastTimePlayed;
    monster.catchable = catchable;
    monster.level = 0;
    await this.levelUpService.levelUps(monster, level, true);
    if (ObjectUtil.isNotNullOrUndefined(hp)) {
      monster.stats.hp = hp ? hp : 0;
    }
    // already known abilities
    monster.abilities.push(...abilities.map((a) => a.clone()));
    // learn abilities
    this.abilityService
      .getNewLearnableAbilities(monster)
      .forEach((a) => this.abilityService.learnAbility(monster, a.abilityId));

    this.logger.info(
      `Abilities known: ${monster.abilities.map((a) => a.abilityId).join(", ")}`
    );

    if (ObjectUtil.isNotNullOrUndefined(experience)) {
      monster.experience = experience ? experience : 0;
    }
    if (ObjectUtil.isNotNullOrUndefined(currentLevelExperience)) {
      monster.currentLevelExperience = currentLevelExperience
        ? currentLevelExperience
        : 0;
    }
    monster.activeEffects = activeEffects.map((e) => e.clone());
    monster.movements = movement;
    monster.coordinates = new Point(0, 0);
    return monster;
  }

  public canActiveMonsterMove(): boolean {
    return this.availableActiveMonsterMoves() > 0;
  }

  public availableActiveMonsterMoves(): number {
    const current = this.historyRepository.getCurrent();
    const stepsDone = current
      .getByTypes([ActionType.MOVE])
      .map((a) => a.distance)
      .reduce((prev, curr) => prev + curr, 0);

    return current.monster.movements.steps - stepsDone;
  }

  public canActiveMonsterCatch(): boolean {
    const current = this.historyRepository.getCurrent();
    const actionsDone = current.getByTypes([
      ActionType.ABILITY,
      ActionType.CATCH,
    ]).length;
    return actionsDone === 0;
  }

  public canActiveMonsterUseAbility(): boolean {
    const current = this.historyRepository.getCurrent();
    const actionsDone = current.getByTypes([
      ActionType.ABILITY,
      ActionType.CATCH,
    ]).length;
    return actionsDone === 0;
  }
}
