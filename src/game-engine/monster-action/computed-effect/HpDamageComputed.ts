import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class HpDamageComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.HpDamageComputed"
  );

  target;
  damage;

  public constructor(target: Monster, damage: number) {
    super();
    this.target = target;
    this.damage = damage;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }
  public getDamage(): number {
    return this.damage;
  }
  public async render(): Promise<void> {
    return super.showTextOverMonster(this.target, "TODO");
  }
  public applyAfterRender(): void {
    this.logger.info(
      `BATTLE HpDamageComputed: ${this.damage} HP damage to ${this.target.name}`
    );
    this.target.stats.hp -= this.damage;
  }
}
