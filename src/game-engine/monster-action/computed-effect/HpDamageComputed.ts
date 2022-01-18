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
    return super.showTextOverMonster(this.target, "TODO");
  }
  public async onHitAfter(): Promise<void> {
    this.logger.info(
      `BATTLE HpDamageComputed: ${this.damage} HP damage to ${this.target.name}`
    );
    this.target.stats.hp -= this.damage;
  }
}
