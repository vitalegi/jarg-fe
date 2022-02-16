import AbsorbLifeComputed from "@/game-engine/ability/computed-effect/AbsorbLifeComputed";
import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import { FixedDuration } from "@/game-engine/ability/effects/duration/FixedDuration";
import { RandomDuration } from "@/game-engine/ability/effects/duration/RandomDuration";
import Effect from "@/game-engine/ability/effects/effect/Effect";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";
import { asDecimal } from "@/utils/JsonUtil";

export default class AbsorbLifeEffect extends Effect {
  public static KEY = "ABSORB_LIFE";
  percentage = 0;

  public constructor(percentage: number) {
    super(AbsorbLifeEffect.KEY);
    this.percentage = percentage;
  }

  protected doValidate(): void {
    if (this.percentage <= 0) {
      throw Error(`Absorb Life must have percentage > 0`);
    }
  }

  public static fromJson(json: any): AbsorbLifeEffect {
    const effect = new AbsorbLifeEffect(asDecimal(json.percentage));
    Effect.fromJson(effect, json);
    return effect;
  }
  public clone(): Effect {
    const out = new AbsorbLifeEffect(this.percentage);
    super._clone(out);
    out.type = this.type;
    out.percentage = this.percentage;
    return out;
  }
  public toJson(): any {
    const out: any = {};
    super._toJson(out);
    out.type = this.type;
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
      `Against ${target.uuid}, AbsorbLife effect passed: ${pass}`
    );
    if (pass) {
      return [
        new AbsorbLifeComputed(
          this.duration.create(),
          source,
          effectTarget,
          ability,
          this.percentage
        ),
      ];
    }
    return [];
  }
  public supportedDurations(): string[] {
    return [FixedDuration.TYPE, RandomDuration.TYPE];
  }

  public summary(): string {
    const percentage = Math.round(100 * this.percentage);
    return `${super.conditionsSummary()} then absorb ${percentage}% life`;
  }
}
