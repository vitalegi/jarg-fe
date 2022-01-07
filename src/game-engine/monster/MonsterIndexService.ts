import Container, { Service } from "typedi";
import MonsterIndexRepository from "../repositories/MonsterIndexRepository";
import MonsterIndex from "./MonsterIndex";

@Service()
export default class MonsterIndexService {
  protected repo = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );

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
