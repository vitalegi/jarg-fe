import Point from "@/models/Point";
import RandomService from "@/services/RandomService";
import Container, { Service } from "typedi";
import { LevelUpService } from "../monster/LevelUpService";
import Monster from "../monster/Monster";
import MonsterService from "../monster/MonsterService";
import LocalizedEncounters from "./LocalizedEncounters";
import MapContainer from "./MapContainer";
import MapModel from "./MapModel";
import RandomEncounter from "./RandomEncounter";

@Service()
export default class MapService {
  protected randomService = Container.get<RandomService>(RandomService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected monsterService = Container.get<MonsterService>(MonsterService);

  public async generate(model: MapModel): Promise<MapContainer> {
    const map = new MapContainer();
    map.id = model.id;
    map.name = model.name;
    map.sprites = model.sprites;
    map.tiles = model.tiles.map((tile) => tile.clone());

    for (let i = 0; i < model.randomEncounters.length; i++) {
      await this.addLocalizedMonsters(map, model.randomEncounters[i]);
    }
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

    // TODO add check: can walk over this tile?

    const acceptablePositions = map.tiles
      .map((t) => t.coordinates)
      .filter(isInRange)
      .filter(isNotOccupied);

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
    const monster = this.monsterService.createMonster(
      null,
      randomEncounter.monsterId
    );

    const min = randomEncounter.levelMin;
    const max = randomEncounter.levelMax;
    const level = this.randomService.randomInt(min, max);

    while (monster.level < level) {
      await this.levelUpService.levelUp(monster, true);
    }
    return monster;
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
}
