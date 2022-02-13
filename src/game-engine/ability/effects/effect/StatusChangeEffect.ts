import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import StatusChangeComputed from "@/game-engine/ability/computed-effect/StatusChangeComputed";
import { FixedDuration } from "@/game-engine/ability/effects/duration/FixedDuration";
import { RandomDuration } from "@/game-engine/ability/effects/duration/RandomDuration";
import Effect from "@/game-engine/ability/effects/effect/Effect";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/monster/Monster";
import StatusContants from "@/game-engine/monster/status/StatusContants";
import { LocalizationUtil } from "@/services/LocalizationService";
import { asString } from "@/utils/JsonUtil";

export default class StatusChangeEffect extends Effect {
  public static KEY = "STATUS_CHANGE";
  status = "";

  public constructor(status: string) {
    super(StatusChangeEffect.KEY);
    this.status = status;
  }
  protected doValidate(): void {
    if (StatusContants.COLLECTION.indexOf(this.status) === -1) {
      throw Error(`Invalid status in StatusChange`);
    }
  }

  public static fromJson(json: any): StatusChangeEffect {
    const effect = new StatusChangeEffect(asString(json.status));
    Effect.fromJson(effect, json);
    return effect;
  }
  public clone(): Effect {
    const out = new StatusChangeEffect(this.status);
    super._clone(out);
    out.type = this.type;
    out.status = this.status;
    return out;
  }
  public toJson(): any {
    const out: any = {};
    super._toJson(out);
    out.type = this.type;
    out.status = this.status;
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

    this.logger.info(`Against ${target.uuid}, ${this.status} passed: ${pass}`);

    if (pass) {
      return [
        new StatusChangeComputed(
          this.duration.create(),
          effectTarget,
          this.status
        ),
      ];
    }
    return [];
  }
  public summary(): string {
    return `${super.conditionsSummary()} then apply ${LocalizationUtil.getStatus(
      this.status
    )}`;
  }
  public supportedDurations(): string[] {
    return [FixedDuration.TYPE, RandomDuration.TYPE];
  }
}
