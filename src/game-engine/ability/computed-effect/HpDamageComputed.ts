import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import Duration from "@/game-engine/ability/effects/duration/Duration";
import Monster from "@/game-engine/model/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";

export default class HpDamageComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.HpDamageComputed"
  );
  public static TYPE = "HP_DAMAGE";

  target;
  damage;

  public constructor(duration: Duration, target: Monster, damage: number) {
    super(HpDamageComputed.TYPE, duration);
    this.target = target;
    this.damage = damage;
  }
  protected doClone(): ComputedEffect {
    return new HpDamageComputed(this.duration, this.target, this.damage);
  }
  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }
  public getDamage(): number {
    return this.damage;
  }
  public async onHitRender(): Promise<void> {
    await super.showTextOverMonster(
      this.target,
      `${this.formatNumber(this.damage)} HP`
    );
    await this.safeUpdateHealth(this.target, -this.damage);
  }
  public async onHitAfter(): Promise<void> {
    this.logger.info(
      `Change HP of ${this.target.name}: ${-this.damage} HP, starting from ${
        this.target.stats.hp
      }`
    );
    this.target.stats.hp = super.getHealthChange(this.target, -this.damage);
  }
}
