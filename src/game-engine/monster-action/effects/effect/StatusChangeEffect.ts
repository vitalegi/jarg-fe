import Monster from "@/game-engine/monster/Monster";
import Ability from "../../ability/Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import Effect from "./Effect";
import StatusChangeComputed from "../../computed-effect/StatusChangeComputed";

export default class StatusChangeEffect extends Effect {
  public static KEY = "STATUS_CHANGE";
  status = "";

  public constructor(status: string) {
    super(StatusChangeEffect.KEY);
    this.status = status;
  }

  public static fromJson(json: any): StatusChangeEffect {
    const effect = new StatusChangeEffect(json.status);
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
      return [new StatusChangeComputed(effectTarget, this.status)];
    }
    return [];
  }
  public summary(): string {
    return `${super._summary()} is ${this.status}`;
  }
}
