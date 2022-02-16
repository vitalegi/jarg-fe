import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import HealComputed from "@/game-engine/ability/computed-effect/HealComputed";
import { Immediate } from "@/game-engine/ability/effects/duration/Immediate";
import Effect from "@/game-engine/ability/effects/effect/Effect";
import FormulaService from "@/game-engine/FormulaService";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";
import { asInt } from "@/utils/JsonUtil";
import Container from "typedi";

export default class HealEffect extends Effect {
  public static KEY = "HP_HEAL";

  power;

  public constructor() {
    super(HealEffect.KEY);
    this.power = 0;
  }
  protected doValidate(): void {
    return;
  }

  public static fromJson(json: any): HealEffect {
    const effect = new HealEffect();
    Effect.fromJson(effect, json);
    effect.power = asInt(json.power);
    return effect;
  }
  public clone(): Effect {
    const out = new HealEffect();
    super._clone(out);
    out.power = this.power;
    return out;
  }
  public toJson(): any {
    const out: any = {};
    super._toJson(out);
    out.power = this.power;
    return out;
  }
  public summary(): string {
    return `${super.conditionsSummary()} heal ${this.target.type}`;
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
      const heal = this.getFormulaService().heal(source.stats.int, this.power);
      return [
        new HealComputed(
          this.duration.create(),
          effectTarget,
          heal,
          source.uuid,
          ability.id
        ),
      ];
    }
    return [];
  }
  public supportedDurations(): string[] {
    return [Immediate.TYPE];
  }

  protected getFormulaService(): FormulaService {
    return Container.get(FormulaService);
  }
}
