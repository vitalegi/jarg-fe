import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import { Service } from "typedi";

@Service()
export default class MonsterIndexEditorRepository {
  public load(): MonsterIndex[] {
    const entry = window.localStorage.getItem("monstersIndex");
    if (entry === null) {
      return new Array<MonsterIndex>();
    }
    const json = JSON.parse(entry);
    return json.map(MonsterIndex.fromJson);
  }

  public save(monsters: MonsterIndex[]): void {
    window.localStorage.setItem("monstersIndex", JSON.stringify(monsters));
  }
}
