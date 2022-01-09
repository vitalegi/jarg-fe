import Monster from "@/game-engine/monster/Monster";
import Ability from "../../Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import HpDamageComputed from "../../computed-effect/HpDamageComputed";
import MissComputed from "../../computed-effect/MissComputed";
import Effect from "./Effect";

export default class HpDamageEffect extends Effect {
  public static KEY = "HP_DAMAGE";
  type = HpDamageEffect.KEY;
  damage = 0;

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
      return [new HpDamageComputed(effectTarget, this.damage)];
    }
    return [new MissComputed(effectTarget)];
  }
}
