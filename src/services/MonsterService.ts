import Ability from "@/game-engine/monster-action/Ability";
import {
  CharacterType,
  Monster,
  MonsterIndex,
  Stats,
} from "@/models/Character";
import RandomService from "@/services/RandomService";
import UuidUtil from "@/utils/UuidUtil";
import Container, { Service } from "typedi";

@Service()
export default class MonsterService {
  private monstersIndex = new Map<string, MonsterIndex>();
  private randomService = Container.get<RandomService>(RandomService);

  public init(monsters: MonsterIndex[]): void {
    this.monstersIndex = new Map<string, MonsterIndex>();
    monsters.forEach((monster) =>
      this.monstersIndex.set(monster.monsterId, monster)
    );
  }

  public getMonster(monsterId: string): MonsterIndex {
    const monster = this.monstersIndex.get(monsterId);
    if (monster) {
      return monster;
    }
    throw new Error(`Missing monster ${monsterId}.`);
  }

  public getMonsters(): MonsterIndex[] {
    const monsters: MonsterIndex[] = [];
    this.monstersIndex.forEach((value) => monsters.push(value));
    return monsters;
  }

  public createMonster(ownerId: null | string): Monster {
    const monster = new Monster();
    monster.uuid = UuidUtil.nextId();
    monster.level = 5;
    monster.name = UuidUtil.nextId().substring(0, 10);
    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;
    monster.modelId = this.randomService.randomInt(2) == 1 ? "004" : "007";
    monster.baseStats = new Stats(30, 30, 6, 5, 3, 3, 10, 8);
    monster.stats = new Stats(15, 15, 12, 10, 6, 5, 20, 19);
    monster.growthRates = new Stats(120, 120, 100, 80, 70, 80, 100, 110);
    monster.abilities.push(new Ability("Attacco 1"));
    monster.abilities.push(new Ability("Attacco 2"));
    monster.abilities.push(new Ability("Attacco 3"));

    return monster;
  }
}
