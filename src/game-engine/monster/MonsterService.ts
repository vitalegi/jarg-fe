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

  public createMonster(ownerId: null | string): Monster {
    const monster = new Monster();
    monster.uuid = UuidUtil.nextId();
    monster.level = 5;

    const random = Container.get<RandomService>(RandomService);

    monster.name = names[random.randomInt(names.length)];
    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;

    const monstersIndex = this.monsterIndexRepository.getMonsters();
    monster.modelId =
      monstersIndex[random.randomInt(monstersIndex.length)].monsterId;

    monster.baseStats = new Stats(
      30,
      30,
      6,
      5,
      3,
      3,
      10,
      8,
      10 + random.randomInt(5)
    );
    monster.stats = new Stats(15, 15, 12, 10, 6, 5, 20, 19, 20);
    monster.growthRates = new Stats(120, 120, 100, 80, 70, 80, 100, 110, 100);

    const abilities = this.abilityRepository.getAbilities();

    monster.abilities.push(
      abilities[random.randomInt(abilities.length)].clone()
    );
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
}
