import { Service } from "typedi";
import MonsterIndex from "../monster/MonsterIndex";

@Service()
export default class MonsterIndexRepository {
  private monstersIndex = new Map<string, MonsterIndex>();

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
}
