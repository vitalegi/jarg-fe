import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import ComputedEffectUtil from "@/game-engine/ability/computed-effect/ComputedEffectUtil";
import Duration from "@/game-engine/ability/effects/duration/Duration";
import FormulaService from "@/game-engine/FormulaService";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";

export default class AbsorbLifeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.AbsorbLifeComputed"
  );
  public static TYPE = "ABSORB_LIFE";

  source;
  target;
  ability;
  percentage;
  nextDamage;

  public constructor(
    duration: Duration,
    source: Monster,
    target: Monster,
    ability: Ability,
    percentage: number
  ) {
    super(AbsorbLifeComputed.TYPE, duration, source.uuid, ability.id);
    this.source = source;
    this.target = target;
    this.percentage = percentage;
    this.ability = ability;
    this.nextDamage = 0;
  }

  protected doClone(): ComputedEffect {
    return new AbsorbLifeComputed(
      this.duration,
      this.source,
      this.target,
      this.ability,
      this.percentage
    );
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async onHitRender(): Promise<void> {
    await super.showTextOverMonster(this.target, `Absorb Life`);
  }
  public async onHitAfter(): Promise<void> {
    this.logger.info(
      `Apply AbsorbLife status: reduce life of ${this.target.name} by ${
        this.percentage * 100
      }% every turn`
    );
    this.target.activeEffects.push(this);
  }
  public async turnStartBefore(): Promise<void> {
    this.nextDamage = this.getDamage();
    if (this.source.isDead()) {
      this.logger.info(
        `Monster ${this.source.name} - ${this.source.uuid} is dead, effects of AbsorbLife no longer apply`
      );
      this.target.activeEffects = this.target.activeEffects.filter((e) => {
        if (ComputedEffectUtil.isAbsorbLife(e)) {
          const absorbLife = e as AbsorbLifeComputed;
          return absorbLife.source.uuid !== this.source.uuid;
        } else {
          return true;
        }
      });
    }
  }
  public async turnStartRender(): Promise<void> {
    const n = this.formatNumber(this.nextDamage);
    await Promise.all([
      super.showTextOverMonster(this.target, `-${n} HP`),
      super.showTextOverMonster(this.source, `${n} HP`),
    ]);
    await Promise.all([
      this.safeUpdateHealth(this.source, this.nextDamage),
      this.safeUpdateHealth(this.target, -this.nextDamage),
    ]);
  }
  public async turnStartAfter(): Promise<void> {
    this.logger.info(
      `${this.source.name} absorbs ${this.nextDamage}HP from ${this.target.name}`
    );
    this.logger.debug(
      `Change HP of ${this.target.name}: ${-this
        .nextDamage} HP, starting from ${this.target.stats.hp}`
    );
    this.target.stats.hp = this.getHealthChange(this.target, -this.nextDamage);
    this.logger.debug(
      `Change HP of ${this.source.name}: ${this.nextDamage} HP, starting from ${this.target.stats.hp}`
    );
    this.source.stats.hp = this.getHealthChange(this.source, this.nextDamage);
  }

  protected getDamage(): number {
    const formulaService = Container.get(FormulaService);
    return formulaService.getPercentageDamage(
      this.source,
      this.target,
      this.ability,
      this.percentage
    );
  }
}
