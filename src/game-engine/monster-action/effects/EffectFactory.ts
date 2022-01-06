import Effect from "./Effect";
import HpDamageEffect from "./HpDamageEffect";

export default class EffectFactory {
  public static fromJson(json: any): Effect {
    if (json.type === HpDamageEffect.KEY) {
      return HpDamageEffect.fromJson(json);
    }
    throw Error(`Unknown effect ${JSON.stringify(json)}`);
  }
}
