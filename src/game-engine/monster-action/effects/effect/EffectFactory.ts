import Effect from "./Effect";
import HpDamageEffect from "./HpDamageEffect";
import StatChangeEffect from "./StatChangeEffect";
import StatusChangeEffect from "./StatusChangeEffect";

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
    throw Error(`Unknown effect ${JSON.stringify(json)}`);
  }
}
