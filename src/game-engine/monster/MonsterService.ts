import * as PIXI from "pixi.js";
import Ability from "@/game-engine/monster-action/Ability";
import { CharacterType, Monster } from "@/models/Character";
import { MapOption } from "@/models/Map";
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
  private static MONSTER_SPRITE_NAME = "monsterSprite";

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

  public createMonster(ownerId: null | string): Monster {
    const monster = new Monster();
    monster.uuid = UuidUtil.nextId();
    monster.level = 5;

    const random = Container.get<RandomService>(RandomService);

    const monstersIndex = this.monsterIndexRepository.getMonsters();
    const monsterIndex = monstersIndex[random.randomInt(monstersIndex.length)];

    monster.modelId = monsterIndex.monsterId;

    monster.name =
      names[random.randomInt(names.length)] + " " + monsterIndex.name;
    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;

    monster.baseStats = new Stats(
      39,
      39 + random.randomInt(5),
      52 + random.randomInt(5),
      43 + random.randomInt(5),
      60 + random.randomInt(5),
      50 + random.randomInt(5),
      65 + random.randomInt(5),
      60 + random.randomInt(5),
      10 + random.randomInt(5)
    );
    monster.stats = new Stats(0, 0, 0, 0, 0, 0, 0, 0, 0);
    monster.growthRates = new Stats(
      100,
      100 + random.randomInt(5),
      100 + random.randomInt(5),
      100 + random.randomInt(5),
      100 + random.randomInt(5),
      100 + random.randomInt(5),
      100 + random.randomInt(5),
      100 + random.randomInt(5),
      100
    );

    const abilities = this.abilityRepository.getAbilities();

    monster.abilities.push(
      abilities[random.randomInt(abilities.length)].clone()
    );
    monster.movements = new Move();
    monster.movements.steps = 3;
    monster.movements.canWalk = true;

    monster.coordinates = new Point(0, 0);
    return monster;
  }

  public createMonsterSprite(
    monster: Monster,
    options: MapOption
  ): PIXI.Container {
    const monsterFamily = this.monsterIndexRepository.getMonster(
      monster.modelId
    );
    const sprite = this.rendererService.createMonsterSprite(monsterFamily);
    sprite.name = MonsterService.MONSTER_SPRITE_NAME;

    const container = new PIXI.Container();
    container.name = monster.uuid;
    container.addChild(sprite);

    if (monster.coordinates) {
      const point = this.coordinateService.getTileCoordinates(
        monster.coordinates,
        options
      );
      container.x = point.x;
      container.y = point.y;

      sprite.x = (options.tileWidth - sprite.width) / 2;
      sprite.y = (options.tileHeight - sprite.height) / 2;
    }
    this.healthBarService.createBar(container, monster, options);
    this.userActionService.initMonster(monster.uuid, container);
    return container;
  }

  public getMonsterSprite(container: PIXI.Container): PIXI.AnimatedSprite {
    return container.getChildByName(
      MonsterService.MONSTER_SPRITE_NAME
    ) as PIXI.AnimatedSprite;
  }

  public canActiveMonsterMove(): boolean {
    const tick = this.turnManager.activeCharacter();
    if (!tick) {
      return false;
    }
    const moves = tick.actionsHistory
      .filter((a) => a.type === ActionType.MOVE)
      .map((a) => a.distance)
      .reduce((prev, curr) => prev + curr, 0);

    if (!moves) {
      return tick.monster.movements.steps > 0;
    }
    return tick.monster.movements.steps > moves;
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
