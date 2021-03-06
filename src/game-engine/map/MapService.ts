import AbilityService from "@/game-engine/ability/AbilityService";
import LocalizedEncounters from "@/game-engine/model/map/LocalizedEncounters";
import MapContainer from "@/game-engine/model/map/MapContainer";
import MapModel from "@/game-engine/model/map/MapModel";
import RandomEncounter from "@/game-engine/model/map/RandomEncounter";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import Monster from "@/game-engine/model/monster/Monster";
import MonsterService from "@/game-engine/monster/MonsterService";
import TileRepository from "@/game-engine/repositories/TileRepository";
import Point from "@/models/Point";
import RandomService from "@/services/RandomService";
import Container, { Service } from "typedi";

@Service()
export default class MapService {
  protected randomService = Container.get(RandomService);
  protected levelUpService = Container.get(LevelUpService);
  protected monsterService = Container.get(MonsterService);
  protected abilityService = Container.get(AbilityService);
  protected tileRepository = Container.get(TileRepository);

  public async generate(model: MapModel): Promise<MapContainer> {
    const map = new MapContainer();
    map.tiles = model.tiles.map((tile) => tile.clone());

    for (let i = 0; i < model.randomEncounters.length; i++) {
      await this.addLocalizedMonsters(map, model.randomEncounters[i]);
    }
    map.monsters.forEach((m) =>
      this.abilityService
        .getNewLearnableAbilities(m)
        .forEach((a) => this.abilityService.learnAbility(m, a.abilityId))
    );

    return map;
  }

  protected async addLocalizedMonsters(
    map: MapContainer,
    localizedEncounters: LocalizedEncounters
  ): Promise<void> {
    const count = this.randomService.randomInt(
      localizedEncounters.minMonsters,
      localizedEncounters.maxMonsters
    );
    for (let i = 0; i < count; i++) {
      const encounter = this.getRandomEncounter(localizedEncounters.encounters);
      const position = this.getRandomPosition(map, localizedEncounters.area);
      if (position) {
        const monster = await this.createMonster(encounter);
        monster.coordinates = position;
        map.monsters.push(monster);
      }
    }
  }

  protected getRandomPosition(
    map: MapContainer,
    possiblePositions: Point[]
  ): Point | null {
    const isInRange = (p: Point) =>
      possiblePositions.filter((o) => p.equals(o)).length > 0;

    const isNotOccupied = (p: Point) =>
      map.monsters.filter((o) => p.equals(o.coordinates)).length === 0;

    const acceptablePositions = map.tiles
      .map((t) => t.coordinates)
      .filter(isInRange)
      .filter(isNotOccupied)
      .filter((t) => this.canStand(map, t));

    if (acceptablePositions.length === 0) {
      return null;
    }
    return acceptablePositions[
      this.randomService.randomInt(0, acceptablePositions.length - 1)
    ].clone();
  }

  protected async createMonster(
    randomEncounter: RandomEncounter
  ): Promise<Monster> {
    const min = randomEncounter.levelMin;
    const max = randomEncounter.levelMax;
    const level = this.randomService.randomInt(min, max);

    return await this.monsterService.createMonster(
      null,
      randomEncounter.monsterId,
      null,
      level,
      randomEncounter.catchable
    );
  }

  protected getRandomEncounter(
    randomEncounters: RandomEncounter[]
  ): RandomEncounter {
    const sum = randomEncounters
      .map((e) => e.probability)
      .reduce((prev, curr) => prev + curr, 0);

    const random = this.randomService.randomDecimal(0, sum);

    let incremental = 0;
    for (let i = 0; i < randomEncounters.length; i++) {
      incremental += randomEncounters[i].probability;
      if (random <= incremental) {
        return randomEncounters[i];
      }
    }
    return randomEncounters[randomEncounters.length];
  }

  protected canStand(map: MapContainer, p: Point): boolean {
    const model = map.tiles.filter((t) => t.coordinates.equals(p))[0]
      .spriteModel;
    const tile = this.tileRepository.getTile(model);
    return tile.walkable;
  }
}
