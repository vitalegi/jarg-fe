import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import AbilityLearned from "@/game-engine/model/ability/AbilityLearned";
import Stats from "@/game-engine/model/monster/stats/Stats";
import Character from "@/models/Character";
import { asDateOptional, asInt, asString } from "@/utils/JsonUtil";

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
  lastTimePlayed?: Date;

  public static fromJson(monster: any): Monster {
    const out = new Monster();
    Character.fromJsonCharacter(monster, out);
    out.ownerId = asString(monster.ownerId);
    out.level = asInt(monster.level);
    out.experience = asInt(monster.experience);
    out.currentLevelExperience = asInt(monster.currentLevelExperience);
    out.baseStats = Stats.fromJson(monster.baseStats);
    out.stats = Stats.fromJson(monster.stats);
    out.growthRates = Stats.fromJson(monster.growthRates);
    out.lastTimePlayed = asDateOptional(monster.lastTimePlayed);
    if (monster.abilities) {
      out.abilities = monster.abilities.map(AbilityLearned.fromJson);
    }
    if (monster.activeEffects) {
      // TODO check implementation
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
