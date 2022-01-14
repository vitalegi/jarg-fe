import Ability from "@/game-engine/monster-action/ability/Ability";
import { Service } from "typedi";

@Service()
export default class AbilityEditorRepository {
  public load(): Ability[] {
    const entry = window.localStorage.getItem("abilities");
    if (entry === null) {
      return new Array<Ability>();
    }
    const json = JSON.parse(entry);
    return json.map(Ability.fromJson);
  }

  public save(abilities: Ability[]): void {
    window.localStorage.setItem(
      "abilities",
      JSON.stringify(abilities.map((a) => a.toJson()))
    );
  }
}
