import Monster from "@/game-engine/monster/Monster";
import Ability from "../../Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import Effect from "./Effect";
import StatChangeComputed from "../../computed-effect/StatChangeComputed";

export default class StatChangeEffect extends Effect {
  public static KEY = "STATS_PERCENTAGE";
  type = StatChangeEffect.KEY;
  stat = "";
  percentage = 0;

  public static fromJson(json: any): StatChangeEffect {
    const effect = new StatChangeEffect();
    Effect.fromJson(effect, json);
    effect.stat = json.stat;
    effect.percentage = json.percentage;
    return effect;
  }
  public clone(): Effect {
    const out = new StatChangeEffect();
    super._clone(out);
    out.type = this.type;
    out.stat = this.stat;
    out.percentage = this.percentage;
    return out;
  }

  apply(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): ComputedEffect[] {
    const effectTarget = this.target.getTarget(source, target);
    const pass = this.passConditions(source, effectTarget, ability, hit);

    console.log(
      `StatChangeEffect against ${target.uuid} (${this.percentage}% ${this.stat}) passed: ${pass}`
    );

    if (pass) {
      return [new StatChangeComputed(effectTarget, this.stat, this.percentage)];
    }
    return [];
  }
}