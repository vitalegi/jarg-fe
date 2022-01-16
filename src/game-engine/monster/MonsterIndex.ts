import { Animation, AnimationSrc } from "@/models/Animation";
import Stats from "@/game-engine/monster/stats/Stats";
import AbilityLearnable from "../monster-action/ability/AbilityLearnable";
import MonsterEvolution from "./monster-evolution/MonsterEvolution";

export default class MonsterIndex {
  monsterId = "";
  name = "";
  animationsSrc: AnimationSrc[] = [];
  animations: Animation[] = [];
  baseStats = new Stats();
  growthRates = new Stats();
  types: string[] = [];
  learnableAbilities: AbilityLearnable[] = [];
  evolutions: MonsterEvolution[] = [];

  public static fromJson(data: any): MonsterIndex {
    const out = new MonsterIndex();
    out.monsterId = data.monsterId;
    out.name = data.name;

    if (data.animationsSrc) {
      out.animationsSrc = data.animationsSrc.map((a: any) =>
        AnimationSrc.fromJson(a)
      );
    }
    out.baseStats = Stats.fromJson(data.baseStats);
    out.growthRates = Stats.fromJson(data.growthRates);
    if (data.types) {
      out.types = data.types.map((t: any) => t);
    }
    if (data.learnableAbilities) {
      out.learnableAbilities = data.learnableAbilities.map(
        AbilityLearnable.fromJson
      );
    }
    if (data.evolutions) {
      out.evolutions = data.evolutions.map(MonsterEvolution.fromJson);
    }
    return out;
  }

  public clone(): MonsterIndex {
    const out = new MonsterIndex();
    out.monsterId = this.monsterId;
    out.name = this.name;
    out.animationsSrc = this.animationsSrc.map((a) => a.clone());
    out.animations = this.animations.map((a) => a.clone());
    out.baseStats = this.baseStats.clone();
    out.growthRates = this.growthRates.clone();
    if (this.types) {
      out.types = this.types.map((t: any) => t);
    }
    out.learnableAbilities = this.learnableAbilities.map((a) => a.clone());
    out.evolutions = this.evolutions.map((a) => a.clone());
    return out;
  }
}
