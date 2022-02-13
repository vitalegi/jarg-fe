import MonsterIndex from "@/game-engine/model/monster/MonsterIndex";
import MonsterIndexRepository from "@/game-engine/repositories/MonsterIndexRepository";
import Container, { Service } from "typedi";

@Service()
export default class MonsterIndexService {
  protected repo = Container.get(MonsterIndexRepository);

  public getMonster(monsterId: string): MonsterIndex {
    return this.repo.getMonster(monsterId);
  }

  public getMonsters(ids: null | string[] = null): MonsterIndex[] {
    const monsters = this.repo.getMonsters();
    if (ids) {
      return monsters.filter((m) => ids.indexOf(m.monsterId) !== -1);
    }
    return monsters;
  }
}
