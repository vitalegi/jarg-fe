import Monster from "@/game-engine/monster/Monster";
import Ability from "../../ability/Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import Effect from "./Effect";
import StatChangeComputed from "../../computed-effect/StatChangeComputed";

export default class StatChangeEffect extends Effect {
  public static KEY = "STATS_PERCENTAGE";
  stat = "";
  percentage = 0;

  public constructor(stat: string, percentage: number) {
    super(StatChangeEffect.KEY);
    this.stat = stat;
    this.percentage = percentage;
  }

  public static fromJson(json: any): StatChangeEffect {
    const effect = new StatChangeEffect(json.stat, json.percentage);
    Effect.fromJson(effect, json);
    return effect;
  }
  public clone(): Effect {
    const out = new StatChangeEffect(this.stat, this.percentage);
    super._clone(out);
    out.type = this.type;
    out.stat = this.stat;
    out.percentage = this.percentage;
    return out;
  }
  public toJson(): any {
    const out: any = {};
    super._toJson(out);
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

    this.logger.info(
      `Against ${target.uuid} (${this.percentage}% ${this.stat}) passed: ${pass}`
    );

    if (pass) {
      return [new StatChangeComputed(effectTarget, this.stat, this.percentage)];
    }
    return [];
  }
  public summary(): string {
    return `${super._summary()} change stat ${this.stat} by ${
      this.percentage * 100
    }% to ${this.target.type}`;
  }
}
