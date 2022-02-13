import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import Duration from "@/game-engine/ability/effects/duration/Duration";
import Monster from "@/game-engine/monster/Monster";
import StatsService from "@/game-engine/monster/stats/StatsService";
import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";

export default class StatChangeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.StatChangeComputed"
  );
  public static TYPE = "STAT_CHANGE";

  target;
  stat;
  percentage;

  public constructor(
    duration: Duration,
    target: Monster,
    stat: string,
    percentage: number
  ) {
    super(StatChangeComputed.TYPE, duration);
    this.target = target;
    this.stat = stat;
    this.percentage = percentage;
  }
  protected doClone(): ComputedEffect {
    return new StatChangeComputed(
      this.duration,
      this.target,
      this.stat,
      this.percentage
    );
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

    const statsService = Container.get<StatsService>(StatsService);
    statsService.updateMonsterAttributes(this.target, false);
  }
}
