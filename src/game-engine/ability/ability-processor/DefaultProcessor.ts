import AbstractProcessor from "@/game-engine/ability/ability-processor/AbstractProcessor";
import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import HpDamageComputed from "@/game-engine/ability/computed-effect/HpDamageComputed";
import MissComputed from "@/game-engine/ability/computed-effect/MissComputed";
import { Immediate } from "@/game-engine/ability/effects/duration/Immediate";
import Effect from "@/game-engine/ability/effects/effect/Effect";
import FormulaService from "@/game-engine/ability/FormulaService";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";

export default class DefaultProcessor extends AbstractProcessor {
  public static NAME = "DEFAULT_SINGLE_TARGET";

  protected formulaService = Container.get<FormulaService>(FormulaService);
  protected logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.AbilityProcessor.DefaultProcessor"
  );

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
        computedEffects.push(
          new HpDamageComputed(new Immediate().create(), target, damage)
        );
      } else {
        computedEffects.push(
          new MissComputed(new Immediate().create(), target)
        );
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
