import Monster from "@/game-engine/monster/Monster";
import Ability from "../../ability/Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import Effect from "./Effect";
import StatChangeComputed from "../../computed-effect/StatChangeComputed";
import { FixedDuration } from "../duration/FixedDuration";
import { RandomDuration } from "../duration/RandomDuration";
import StatsConstants from "@/game-engine/monster/stats/StatsContants";
import { asDecimal, asString } from "@/utils/JsonUtil";

export default class StatChangeEffect extends Effect {
  public static KEY = "STATS_PERCENTAGE";
  stat = "";
  percentage = 0;

  public constructor(stat: string, percentage: number) {
    super(StatChangeEffect.KEY);
    this.stat = stat;
    this.percentage = percentage;
  }
  protected doValidate(): void {
    if (StatsConstants.COLLECTION.indexOf(this.stat) === -1) {
      throw Error(`Invalid stat ${this.stat}`);
    }
    if (this.percentage === 0) {
      throw Error(`Stat change must have percentage != 0`);
    }
  }

  public static fromJson(json: any): StatChangeEffect {
    const effect = new StatChangeEffect(
      asString(json.stat),
      asDecimal(json.percentage)
    );
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
      return [
        new StatChangeComputed(
          this.duration.create(),
          effectTarget,
          this.stat,
          this.percentage
        ),
      ];
    }
    return [];
  }
  public summary(): string {
    return `${super.conditionsSummary()} then change ${this.target.type}'s ${
      this.stat
    } by ${this.percentage * 100}%`;
  }
  public supportedDurations(): string[] {
    return [FixedDuration.TYPE, RandomDuration.TYPE];
  }
}
