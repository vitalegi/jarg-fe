import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class HpDamageComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.HpDamageComputed"
  );
  public static TYPE = "HP_DAMAGE";

  target;
  damage;

  public constructor(target: Monster, damage: number) {
    super(HpDamageComputed.TYPE);
    this.target = target;
    this.damage = damage;
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
