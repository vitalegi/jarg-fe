import Monster from "@/game-engine/monster/Monster";
import Container from "typedi";
import Ability from "../ability/Ability";
import ComputedEffect from "../computed-effect/ComputedEffect";
import HpDamageComputed from "../computed-effect/HpDamageComputed";
import MissComputed from "../computed-effect/MissComputed";
import Effect from "../effects/effect/Effect";
import FormulaService from "../FormulaService";
import AbstractProcessor from "./AbstractProcessor";

export default class DefaultProcessor extends AbstractProcessor {
  public static NAME = "DEFAULT_SINGLE_TARGET";

  protected formulaService = Container.get<FormulaService>(FormulaService);

  name = DefaultProcessor.NAME;

  public async execute(
    source: Monster,
    target: Monster,
    ability: Ability
  ): Promise<ComputedEffect[]> {
    const computedEffects: ComputedEffect[] = [];

    const hit = this.formulaService.hit(source, target, ability);
    if (ability.damage) {
      const damage = this.formulaService.damage(source, target, ability);
      if (hit) {
        computedEffects.push(new HpDamageComputed(target, damage));
      } else {
        computedEffects.push(new MissComputed(target));
      }
    }
    const additionalEffects = await this.computeAdditionalEffects(
      source,
      target,
      ability,
      hit
    );
    computedEffects.push(...additionalEffects);

    return computedEffects;
  }

  protected async computeAdditionalEffects(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): Promise<ComputedEffect[]> {
    const effects = ability.additionalEffects.map((effect) =>
      this.computeAdditionalEffect(source, target, ability, hit, effect)
    );
    const results = await Promise.all(effects);
    return results.flatMap((e) => e);
  }

  protected async computeAdditionalEffect(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean,
    effect: Effect
  ): Promise<ComputedEffect[]> {
    return effect.apply(source, target, ability, hit);
  }
}
