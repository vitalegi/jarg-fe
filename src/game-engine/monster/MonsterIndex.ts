import { Animation, AnimationSrc } from "@/models/Animation";
import Stats from "@/game-engine/monster/stats/Stats";
import AbilityLearnable from "../monster-action/ability/AbilityLearnable";
import MonsterEvolution from "./monster-evolution/MonsterEvolution";
import TypeConstants from "../types/TypeConstants";

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
  public isValid(monsterIds: string[], abilityIds: string[]): boolean {
    try {
      this.validate(monsterIds, abilityIds);
      return true;
    } catch (e) {
      return false;
    }
  }
  public validate(monsterIds: string[], abilityIds: string[]): void {
    if (this.monsterId.trim() === "") {
      throw Error(`ID must not be null`);
    }
    if (this.name.trim() === "") {
      throw Error(`Label must not be null`);
    }
    if (this.baseStats.totalPoints() <= 0) {
      throw Error(`Total base stats points must be >= 0`);
    }
    if (this.growthRates.totalPoints() <= 0) {
      throw Error(`Total growth rates points must be >= 0`);
    }
    if (this.types.length === 0) {
      throw Error(`Must have at least one type`);
    }
    this.types.forEach((type) => {
      if (TypeConstants.getTypes().indexOf(type) === -1) {
        throw Error(`Type ${type} is not recognized`);
      }
    });
    this.learnableAbilities.forEach((learnable) => {
      if (abilityIds.indexOf(learnable.abilityId) === -1) {
        throw Error(
          `Ability ${learnable.toString()} not present in abilities list`
        );
      }
      if (
        this.learnableAbilities.filter(
          (a) => a.abilityId === learnable.abilityId
        ).length > 1
      ) {
        throw Error(`Ability ${learnable.toString()} is duplicated`);
      }
    });
    this.evolutions.forEach((evolution) => {
      if (monsterIds.indexOf(evolution.evolutionId) === -1) {
        throw Error(
          `Evolution ${evolution.toString()} not present in monsters list`
        );
      }
    });
  }
}
