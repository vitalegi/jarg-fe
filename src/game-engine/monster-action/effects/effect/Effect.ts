import Monster from "@/game-engine/monster/Monster";
import Ability from "../../Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import Statistics from "../../Statistics";
import Condition from "../condition/Condition";
import ConditionFactory from "../condition/ConditionFactory";
import Target from "../target/Target";

export type EffectComputeType = "percentage" | "abs";

export default abstract class Effect {
  target = new Target();
  conditions: Condition[] = [];

  public static fromJson(effect: Effect, json: any): void {
    effect.target = Target.fromJson(json.target);
    if (json.conditions) {
      effect.conditions = json.conditions.map(ConditionFactory.fromJson);
    }
  }

  public abstract clone(): Effect;

  protected _clone(obj: Effect): void {
    obj.target = this.target.clone();
    obj.conditions = this.conditions.map((c) => c.clone());
  }

  abstract apply(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): ComputedEffect[];

  protected passConditions(
    source: Monster,
    effectTarget: Monster,
    ability: Ability,
    hit: boolean
  ): boolean {
    const notPassed = this.conditions.filter(
      (condition) => !condition.accept(source, effectTarget, ability, hit)
    );
    const pass = notPassed.length === 0;
    if (!pass) {
      console.log(
        `Condition not met: ${notPassed.map((c) => c.toString()).join(", ")}`
      );
    }
    return pass;
  }

  protected getValue(monster: Monster, stat: Statistics): number {
    if (stat === "hp") {
      return monster.stats.hp;
    }
    if (stat === "atk") {
      return monster.stats.atk;
    }
    if (stat === "def") {
      return monster.stats.def;
    }
    throw new Error(`Unknown stat ${stat}`);
  }

  protected setValue(monster: Monster, stat: Statistics, value: number): void {
    if (stat === "hp") {
      monster.stats.hp = value;
    }
    if (stat === "atk") {
      monster.stats.atk = value;
    }
    if (stat === "def") {
      monster.stats.def = value;
    }
  }
}
