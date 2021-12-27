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
    monster.name = UuidUtil.nextId().substring(0, 10);
    monster.ownerId = ownerId;
    monster.type = CharacterType.MONSTER;
    monster.modelId = this.randomService.randomInt(2) == 1 ? "004" : "007";
    monster.stats = new Stats();
    monster.stats.hp = 1000;
    monster.stats.atk = 100;
    monster.stats.def = 50;
    return monster;
  }
}
