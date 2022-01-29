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
    monsters.forEach((m) => {
      m.evolutions = m.evolutions.sort((a, b) =>
        a.evolutionId > b.evolutionId ? 1 : -1
      );
      m.learnableAbilities = m.learnableAbilities.sort((a, b) =>
        a.toString() > b.toString() ? 1 : -1
      );
    });
    window.localStorage.setItem("monstersIndex", JSON.stringify(monsters));
  }
}
