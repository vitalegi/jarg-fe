import Ability from "@/game-engine/monster-action/Ability";
import Character from "../../models/Character";
import Stats from "../../models/Stats";

export default class Monster extends Character {
  ownerId: string | null = "";
  level = 0;
  experience = 0;
  currentLevelExperience = 0;
  /**
   * Stats at level 1
   */
  baseStats = new Stats();
  /**
   * Stats at current level, with no buf/debuf
   */
  stats = new Stats();
  growthRates = new Stats();

  abilities: Ability[] = [];

  public static fromJson(monster: any): Monster {
    const out = new Monster();
    Character.fromJson(monster, out);
    out.ownerId = monster.ownerId;
    out.level = monster.level;
    out.experience = monster.experience;
    out.currentLevelExperience = monster.currentLevelExperience;
    out.baseStats = Stats.fromJson(out.baseStats);
    out.stats = Stats.fromJson(out.stats);
    out.growthRates = Stats.fromJson(out.growthRates);
    if (monster.abilities) {
      out.abilities = monster.abilities.map((a: any) => Ability.fromJson(a));
    }
    return out;
  }
}
