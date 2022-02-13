import AbsorbLifeComputed from "@/game-engine/ability/computed-effect/AbsorbLifeComputed";
import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import StatChangeComputed from "@/game-engine/ability/computed-effect/StatChangeComputed";
import StatusChangeComputed from "@/game-engine/ability/computed-effect/StatusChangeComputed";

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
