import * as PIXI from "pixi.js";
import { CharacterType, Monster } from "@/models/Character";
import { MapOption } from "@/game-engine/map/MapContainer";
import Stats from "@/models/Stats";
import RandomService from "@/services/RandomService";
import RendererService from "@/services/RendererService";
import UserActionService from "@/game-engine/user-action-handler/UserActionService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import CoordinateService from "../CoordinateService";
import MonsterIndexRepository from "../repositories/MonsterIndexRepository";
import HealthBarService from "./HealthBarService";
import Point from "@/models/Point";
import AbilityRepository from "../repositories/AbilityRepository";
import Move from "@/models/Move";
import TurnManager, { ActionType } from "../turns/TurnManager";

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
  protected rendererService = Container.get(RendererService);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);

  protected healthBarService =
    Container.get<HealthBarService>(HealthBarService);
  protected turnManager = Container.get<TurnManager>(TurnManager);

  public createMonster(
    ownerId: string | null,
    monsterIndexId: string | null = null,
    name: string | null = null
  ): Monster {
    const monster = new Monster();
    monster.uuid = UuidUtil.nextId();
    monster.level = 5;

    const random = Container.get<RandomService>(RandomService);

    if (!monsterIndexId) {
      const monstersIndex = this.monsterIndexRepository.getMonsters();
      monsterIndexId =
        monstersIndex[random.randomInt(monstersIndex.length)].monsterId;
    }

    const monsterIndex = this.monsterIndexRepository.getMonster(monsterIndexId);
    monster.modelId = monsterIndex.monsterId;

    if (name) {
      monster.name = name;
    } else {
      monster.name =
        names[random.randomInt(names.length)] + " " + monsterIndex.name;
    }

    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;

    monster.baseStats = monsterIndex.baseStats.clone();
    monster.stats = new Stats(0, 0, 0, 0, 0, 0, 0, 0, 0);
    monster.growthRates = monsterIndex.growthRates.clone();

    const abilities = this.abilityRepository.getAbilities();

    monster.abilities.push(
      abilities[random.randomInt(abilities.length)].clone()
    );
    // TODO move to MonsterIndex
    monster.movements = new Move();
    monster.movements.steps = 3;
    monster.movements.canWalk = true;

    monster.coordinates = new Point(0, 0);
    return monster;
  }
  public canActiveMonsterMove(): boolean {
    return this.availableActiveMonsterMoves() > 0;
  }

  public availableActiveMonsterMoves(): number {
    const tick = this.turnManager.activeCharacter();
    if (!tick) {
      return 0;
    }
    const moves = tick.actionsHistory
      .filter((a) => a.type === ActionType.MOVE)
      .map((a) => a.distance)
      .reduce((prev, curr) => prev + curr, 0);

    if (!moves) {
      return tick.monster.movements.steps;
    }
    return tick.monster.movements.steps - moves;
  }

  public canActiveMonsterUseAbility(): boolean {
    const tick = this.turnManager.activeCharacter();
    if (!tick) {
      console.log(`No active monster`);
      return false;
    }
    const count = tick.actionsHistory
      .filter((a) => a.type === ActionType.ABILITY)
      .map((a) => a.distance).length;

    return count === 0;
  }
}
