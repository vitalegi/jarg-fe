import AbsorbLifeComputed from "./AbsorbLifeComputed";
import ComputedEffect from "./ComputedEffect";
import StatChangeComputed from "./StatChangeComputed";
import StatusChangeComputed from "./StatusChangeComputed";

export default class ComputedEffectUtil {
  public static getStatChanges(
    effects: ComputedEffect[]
  ): StatChangeComputed[] {
    return effects
      .filter((e) => e.type === StatChangeComputed.TYPE)
      .map((e) => e as StatChangeComputed);
  }

  public static getStatusAlterations(
    effects: ComputedEffect[]
  ): StatusChangeComputed[] {
    return effects
      .filter((e) => e.type === StatusChangeComputed.TYPE)
      .map((e) => e as StatusChangeComputed);
  }
  public static isAbsorbLife(effect: ComputedEffect): boolean {
    return effect.type === AbsorbLifeComputed.TYPE;
  }
}
