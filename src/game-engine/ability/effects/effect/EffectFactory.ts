import AbsorbLifeEffect from "@/game-engine/ability/effects/effect/AbsorbLifeEffect";
import Effect from "@/game-engine/ability/effects/effect/Effect";
import HealEffect from "@/game-engine/ability/effects/effect/HealEffect";
import HpDamageEffect from "@/game-engine/ability/effects/effect/HpDamageEffect";
import StatChangeEffect from "@/game-engine/ability/effects/effect/StatChangeEffect";
import StatusChangeEffect from "@/game-engine/ability/effects/effect/StatusChangeEffect";

export default class EffectFactory {
  public static fromJson(json: any): Effect {
    if (json.type === HpDamageEffect.KEY) {
      return HpDamageEffect.fromJson(json);
    }
    if (json.type === StatChangeEffect.KEY) {
      return StatChangeEffect.fromJson(json);
    }
    if (json.type === StatusChangeEffect.KEY) {
      return StatusChangeEffect.fromJson(json);
    }
    if (json.type === AbsorbLifeEffect.KEY) {
      return AbsorbLifeEffect.fromJson(json);
    }
    if (json.type === HealEffect.KEY) {
      return HealEffect.fromJson(json);
    }
    throw Error(`Unknown effect ${JSON.stringify(json)}`);
  }
}
