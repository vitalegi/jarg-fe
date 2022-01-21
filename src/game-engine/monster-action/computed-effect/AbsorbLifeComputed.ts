import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";
import ComputedEffectUtil from "./ComputedEffectUtil";

export default class AbsorbLifeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.AbsorbLifeComputed"
  );
  public static TYPE = "ABSORB_LIFE";

  source;
  target;
  percentage;

  public constructor(source: Monster, target: Monster, percentage: number) {
    super(AbsorbLifeComputed.TYPE);
    this.source = source;
    this.target = target;
    this.percentage = percentage;
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
    const n = this.formatNumber(this.getDamage());
    await Promise.all([
      super.showTextOverMonster(this.target, `-${n} HP`),
      super.showTextOverMonster(this.source, `${n} HP`),
    ]);
    await Promise.all([
      this.safeUpdateHealth(this.source, this.getDamage()),
      this.safeUpdateHealth(this.target, -this.getDamage()),
    ]);
  }
  public async turnStartAfter(): Promise<void> {
    this.logger.info(
      `${this.source.name} absorbs ${this.getDamage()}HP from ${
        this.target.name
      }`
    );
    this.logger.info(
      `Change HP of ${
        this.target.name
      }: ${-this.getDamage()} HP, starting from ${this.target.stats.hp}`
    );
    this.target.stats.hp = this.getHealthChange(this.target, -this.getDamage());
    this.logger.info(
      `Change HP of ${
        this.source.name
      }: ${this.getDamage()} HP, starting from ${this.target.stats.hp}`
    );
    this.source.stats.hp = this.getHealthChange(this.source, this.getDamage());
  }

  protected getDamage(): number {
    return Math.max(1, Math.round(this.target.stats.maxHP * this.percentage));
  }
}
