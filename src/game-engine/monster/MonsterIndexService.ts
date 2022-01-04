import MonsterIndex from "@/models/MonsterIndex";
import Container, { Service } from "typedi";
import MonsterIndexRepository from "../repositories/MonsterIndexRepository";

@Service()
export default class MonsterIndexService {
  protected repo = Container.get<MonsterIndexRepository>(
    MonsterIndexRepository
  );

  public getMonster(monsterId: string): MonsterIndex {
    return this.repo.getMonster(monsterId);
  }

  public getMonsters(): MonsterIndex[] {
    return this.repo.getMonsters();
  }
}
