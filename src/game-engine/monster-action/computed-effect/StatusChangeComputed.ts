import Monster from "@/game-engine/monster/Monster";
import StatusContants from "@/game-engine/monster/status/StatusContants";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class StatusChangeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.StatusChangeComputed"
  );
  public static TYPE = "STATUS_CHANGE";

  target;
  status;

  public constructor(target: Monster, status: string) {
    super(StatusChangeComputed.TYPE);
    this.target = target;
    this.status = status;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }
  public async onHitRender(): Promise<void> {
    return super.showTextOverMonster(this.target, "TODO " + this.status);
  }
  public async onHitAfter(): Promise<void> {
    this.logger.info(`Apply ${this.status} to ${this.target.name}`);
    if (this.status === StatusContants.HASTE) {
      this.removeStatus(this.target, StatusContants.SLOW);
    }
    if (this.status === StatusContants.SLOW) {
      this.removeStatus(this.target, StatusContants.HASTE);
    }
    // TODO add duration
    this.target.activeEffects.push(this);
  }

  protected removeStatus(monster: Monster, remove: string): void {
    monster.activeEffects = monster.activeEffects.filter((a) => {
      if (a.type !== StatusChangeComputed.TYPE) {
        return true;
      }
      const statChange = a as StatusChangeComputed;
      return statChange.status !== remove;
    });
  }
}
