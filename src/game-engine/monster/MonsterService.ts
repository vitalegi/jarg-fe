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
    monster.modelId = random.randomInt(2) == 1 ? "004" : "007";
    monster.baseStats = new Stats(30, 30, 6, 5, 3, 3, 10, 8);
    monster.stats = new Stats(15, 15, 12, 10, 6, 5, 20, 19);
    monster.growthRates = new Stats(120, 120, 100, 80, 70, 80, 100, 110);
    monster.abilities.push(new Ability("Attacco 1"));
    monster.abilities.push(new Ability("Attacco 2"));
    monster.abilities.push(new Ability("Attacco 3"));
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
    const sprite = this.rendererService.createSprite(monsterFamily.sprite);
    sprite.name = "sprite";

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
    }
    this.healthBarService.createBar(container, monster, options);
    this.userActionService.initMonster(monster.uuid, container);
    return container;
  }
}
