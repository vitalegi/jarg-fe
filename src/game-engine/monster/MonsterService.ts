import { CharacterType } from "@/models/Character";
import RandomService from "@/services/RandomService";
import RendererService from "@/services/RendererService";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import CoordinateService from "../CoordinateService";
import MonsterIndexRepository from "../repositories/MonsterIndexRepository";
import Point from "@/models/Point";
import Move from "@/models/Move";
import HistoryRepository from "../battle/turns/HistoryRepository";
import { LevelUpService } from "./LevelUpService";
import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityService from "../monster-action/ability/AbilityService";
import ActionType from "../battle/turns/ActionType";

const names = [
  "Cino",
  "Dino",
  "Gino",
  "Lino",
  "Mino",
  "Nino",
  "Pino",
  "Rino",
  "Tino",
  "Franco",
];

@Service()
export default class MonsterService {
  logger = LoggerFactory.getLogger("GameEngine.Monster.MonsterService");
  protected rendererService = Container.get(RendererService);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );
  protected abilityService = Container.get<AbilityService>(AbilityService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected historyRepository =
    Container.get<HistoryRepository>(HistoryRepository);

  public createMonster(
    ownerId: string | null,
    monsterIndexId: string | null = null,
    name: string | null = null
  ): Monster {
    const monster = new Monster();
    monster.uuid = UuidUtil.nextId();
    monster.level = 1;

    const random = Container.get<RandomService>(RandomService);

    if (!monsterIndexId) {
      const monstersIndex = this.monsterIndexRepository.getMonsters();
      monsterIndexId =
        monstersIndex[random.randomInt(0, monstersIndex.length - 1)].monsterId;
    }

    const monsterIndex = this.monsterIndexRepository.getMonster(monsterIndexId);
    monster.modelId = monsterIndex.monsterId;

    if (name) {
      monster.name = name;
    } else {
      monster.name =
        names[random.randomInt(0, names.length - 1)] + " " + monsterIndex.name;
    }

    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;

    // TODO move to MonsterIndex
    monster.movements = new Move();
    monster.movements.steps = 3;
    monster.movements.canWalk = true;

    monster.level = 0;
    monster.baseStats = monsterIndex.baseStats.clone();
    monster.growthRates = monsterIndex.growthRates.clone();

    this.levelUpService.levelUp(monster, true);

    // learn abilities
    this.abilityService
      .getNewLearnableAbilities(monster)
      .forEach((a) => this.abilityService.learnAbility(monster, a.abilityId));
    this.abilityService.learnAbility(monster, "001");
    this.logger.info(
      `Abilities known: ${monster.abilities.map((a) => a.abilityId).join(", ")}`
    );

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
