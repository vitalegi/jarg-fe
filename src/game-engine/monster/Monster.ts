import Ability from "@/game-engine/monster-action/ability/Ability";
import Character from "../../models/Character";
import StatAlteration from "./stats/StatAlteration";
import Stats from "./stats/Stats";

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
  statsAlterations: StatAlteration[] = [];

  abilities: Ability[] = [];

  public static fromJson(monster: any): Monster {
    const out = new Monster();
    Character.fromJson(monster, out);
    out.ownerId = monster.ownerId;
    out.level = monster.level;
    out.experience = monster.experience;
    out.currentLevelExperience = monster.currentLevelExperience;
    out.baseStats = Stats.fromJson(monster.baseStats);
    out.stats = Stats.fromJson(monster.stats);
    out.growthRates = Stats.fromJson(monster.growthRates);
    if (monster.abilities) {
      out.abilities = monster.abilities.map(Ability.fromJson);
    }
    if (monster.statsAlterations) {
      out.statsAlterations = monster.statsAlterations.map(
        StatAlteration.fromJson
      );
    }
    return out;
  }
}
