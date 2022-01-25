import Character from "../../models/Character";
import AbilityLearned from "../monster-action/ability/AbilityLearned";
import ComputedEffect from "../monster-action/computed-effect/ComputedEffect";
import Stats from "./stats/Stats";

export default class Monster extends Character {
  ownerId: string | null = "";
  level = 0;
  experience = 0;
  currentLevelExperience = 0;
  /**
   * a
   * Stats at level 1
   */
  baseStats = new Stats();
  /**
   * Stats at current level, with no buf/debuf
   */
  stats = new Stats();
  growthRates = new Stats();
  activeEffects: ComputedEffect[] = [];
  abilities: AbilityLearned[] = [];

  public static fromJson(monster: any): Monster {
    const out = new Monster();
    Character.fromJsonCharacter(monster, out);
    out.ownerId = monster.ownerId;
    out.level = monster.level;
    out.experience = monster.experience;
    out.currentLevelExperience = monster.currentLevelExperience;
    out.baseStats = Stats.fromJson(monster.baseStats);
    out.stats = Stats.fromJson(monster.stats);
    out.growthRates = Stats.fromJson(monster.growthRates);
    if (monster.abilities) {
      out.abilities = monster.abilities.map(AbilityLearned.fromJson);
    }
    if (monster.activeEffects) {
      out.activeEffects = monster.activeEffects.map((e: ComputedEffect) =>
        e.clone()
      );
    }
    return out;
  }

  public isDead(): boolean {
    return this.stats.hp <= 0;
  }
}
