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

  public isDead(): boolean {
    return this.stats.hp <= 0;
  }
}
