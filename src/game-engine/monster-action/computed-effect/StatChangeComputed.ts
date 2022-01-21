import Monster from "@/game-engine/monster/Monster";
import StatAlteration from "@/game-engine/monster/stats/StatAlteration";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class StatChangeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.StatChangeComputed"
  );
  public static TYPE = "STAT_CHANGE";

  target;
  stat;
  percentage;

  public constructor(target: Monster, stat: string, percentage: number) {
    super(StatChangeComputed.TYPE);
    this.target = target;
    this.stat = stat;
    this.percentage = percentage;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async onHitRender(): Promise<void> {
    return super.showTextOverMonster(
      this.target,
      `${this.percentage > 0 ? "+" : "-"}${Math.abs(this.percentage) * 100}% ${
        this.stat
      }`
    );
  }
  public async onHitAfter(): Promise<void> {
    this.logger.info(
      `Apply stat change to ${this.target.name}: ${this.percentage * 100}% ${
        this.stat
      }`
    );
    // TODO add duration
    this.target.activeEffects.push(this);
  }
}
