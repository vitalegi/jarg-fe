import Monster from "@/game-engine/monster/Monster";
import Ability from "../../ability/Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import HpDamageComputed from "../../computed-effect/HpDamageComputed";
import MissComputed from "../../computed-effect/MissComputed";
import { Immediate } from "../duration/Immediate";
import Effect from "./Effect";

export default class HpDamageEffect extends Effect {
  public static KEY = "HP_DAMAGE";
  damage = 0;

  public constructor() {
    super(HpDamageEffect.KEY);
  }
  protected doValidate(): void {
    return;
  }

  public static fromJson(json: any): HpDamageEffect {
    const effect = new HpDamageEffect();
    Effect.fromJson(effect, json);
    effect.damage = json.damage;
    return effect;
  }
  public clone(): Effect {
    const out = new HpDamageEffect();
    super._clone(out);
    out.type = this.type;
    out.damage = this.damage;
    return out;
  }
  public toJson(): any {
    const out: any = {};
    super._toJson(out);
    out.type = this.type;
    out.damage = this.damage;
    return out;
  }
  public summary(): string {
    return `${super.conditionsSummary()} apply ${this.damage}HP damage to ${
      this.target.type
    }`;
  }

  apply(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): ComputedEffect[] {
    const effectTarget = this.target.getTarget(source, target);
    const pass = this.passConditions(source, effectTarget, ability, hit);

    this.logger.info(`Against ${target.uuid} passed: ${pass}`);
    if (pass) {
      return [
        new HpDamageComputed(this.duration.create(), effectTarget, this.damage),
      ];
    }
    return [new MissComputed(this.duration.create(), effectTarget)];
  }
  public supportedDurations(): string[] {
    return [Immediate.TYPE];
  }
}
