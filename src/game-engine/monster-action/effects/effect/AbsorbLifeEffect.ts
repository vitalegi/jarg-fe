import Monster from "@/game-engine/monster/Monster";
import Ability from "../../ability/Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import Effect from "./Effect";
import AbsorbLifeComputed from "../../computed-effect/AbsorbLifeComputed";
import { FixedDuration } from "../duration/FixedDuration";
import { RandomDuration } from "../duration/RandomDuration";

export default class AbsorbLifeEffect extends Effect {
  public static KEY = "ABSORB_LIFE";
  percentage = 0;

  public constructor(percentage: number) {
    super(AbsorbLifeEffect.KEY);
    this.percentage = percentage;
  }

  public static fromJson(json: any): AbsorbLifeEffect {
    const effect = new AbsorbLifeEffect(json.percentage);
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
    return `${super._summary()} absorb ${percentage}% life`;
  }
}
