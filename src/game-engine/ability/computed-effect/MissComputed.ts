import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import Duration from "@/game-engine/ability/effects/duration/Duration";
import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";

export default class MissComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.MissComputed"
  );
  public static TYPE = "MISS";

  target;
  public constructor(duration: Duration, target: Monster) {
    super(MissComputed.TYPE, duration);
    this.target = target;
  }

  protected doClone(): ComputedEffect {
    return new MissComputed(this.duration, this.target);
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async onHitAfter(): Promise<void> {
    this.logger.debug(`MissComputed: miss attack to ${this.target.name}`);
    return super.showTextOverMonster(this.target, "MISS");
  }
}
