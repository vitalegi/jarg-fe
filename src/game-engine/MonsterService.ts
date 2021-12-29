import * as PIXI from "pixi.js";
import Ability from "@/game-engine/monster-action/Ability";
import { CharacterType, Monster } from "@/models/Character";
import { MapOption } from "@/models/Map";
import Stats from "@/models/Stats";
import RandomService from "@/services/RandomService";
import RendererService from "@/services/RendererService";
import UserActionService from "@/services/UserActionService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";
import CoordinateService from "./CoordinateService";
import MapSpritesRepository, {
  SpritesConstants,
} from "./repositories/MapSpritesRepository";
import MonsterIndexRepository from "./repositories/MonsterIndexRepository";

@Service()
export default class MonsterService {
  protected rendererService = Container.get(RendererService);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected mapSpritesRepository =
    Container.get<MapSpritesRepository>(MapSpritesRepository);
  protected monsterIndexRepository = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );
  public createMonster(ownerId: null | string): Monster {
    const monster = new Monster();
    monster.uuid = UuidUtil.nextId();
    monster.level = 5;
    monster.name = UuidUtil.nextId().substring(0, 10);
    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;
    monster.modelId =
      Container.get<RandomService>(RandomService).randomInt(2) == 1
        ? "004"
        : "007";
    monster.baseStats = new Stats(30, 30, 6, 5, 3, 3, 10, 8);
    monster.stats = new Stats(15, 15, 12, 10, 6, 5, 20, 19);
    monster.growthRates = new Stats(120, 120, 100, 80, 70, 80, 100, 110);
    monster.abilities.push(new Ability("Attacco 1"));
    monster.abilities.push(new Ability("Attacco 2"));
    monster.abilities.push(new Ability("Attacco 3"));

    return monster;
  }

  public createMonsterSprite(
    monster: Monster,
    options: MapOption
  ): PIXI.Sprite {
    const monsterFamily = this.monsterIndexRepository.getMonster(
      monster.modelId
    );
    const sprite = this.rendererService.createSprite(monsterFamily.sprite);

    this.mapSpritesRepository.add(
      monster.uuid,
      SpritesConstants.MONSTER,
      sprite
    );

    if (monster.coordinates) {
      const point = this.coordinateService.getTileCoordinates(
        monster.coordinates,
        options
      );
      sprite.x = point.x;
      sprite.y = point.y;
    }

    this.userActionService.initMonster(monster.uuid, sprite);
    return sprite;
  }
}
