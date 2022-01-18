import Monster from "@/game-engine/monster/Monster";
import StatAlteration from "@/game-engine/monster/stats/StatAlteration";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class AbsorbLifeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.AbsorbLifeComputed"
  );
  public static TYPE = "ABSORB_LIFE";

  target;
  percentage;

  public constructor(target: Monster, percentage: number) {
    super(AbsorbLifeComputed.TYPE);
    this.target = target;
    this.percentage = percentage;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async onHitRender(): Promise<void> {
    return super.showTextOverMonster(this.target, `-${this.percentage}%`);
  }
  public async onHitAfter(): Promise<void> {
    this.logger.info(
      `Reduce life of ${this.target.name} by ${this.percentage * 100}%`
    );
    // TODO add duration
    this.target.statsAlterations.push(
      new StatAlteration(this.stat, this.percentage)
    );
  }
}
