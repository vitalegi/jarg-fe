import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import Duration from "@/game-engine/ability/effects/duration/Duration";
import Monster from "@/game-engine/model/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";

export default class HealComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.Ability.ComputedEffect.HealComputed"
  );
  public static TYPE = "HEAL";

  target;
  value;

  public constructor(
    duration: Duration,
    target: Monster,
    value: number,
    sourceId: string,
    abilityId: string
  ) {
    super(HealComputed.TYPE, duration, sourceId, abilityId);
    this.target = target;
    this.value = value;
  }
  protected doClone(): ComputedEffect {
    return new HealComputed(
      this.duration,
      this.target,
      this.value,
      this.sourceId,
      this.abilityId
    );
  }
  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }
  public getDamage(): number {
    return 0;
  }
  public async onHitRender(): Promise<void> {
    await super.showTextOverMonster(
      this.target,
      `${this.formatNumber(this.value)} HP`
    );
    await this.safeUpdateHealth(this.target, this.value);
  }
  public async onHitAfter(): Promise<void> {
    this.logger.info(
      `Change HP of ${this.target.name}: ${this.value} HP, starting from ${this.target.stats.hp}`
    );
    this.target.stats.hp = super.getHealthChange(this.target, this.value);
  }
}
