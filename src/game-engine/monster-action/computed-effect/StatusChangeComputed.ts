import Monster from "@/game-engine/monster/Monster";
import StatusAlteration from "@/game-engine/monster/status/StatusAlteration";
import StatusContants from "@/game-engine/monster/status/StatusContants";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class StatusChangeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.StatusChangeComputed"
  );

  target;
  status;

  public constructor(target: Monster, status: string) {
    super();
    this.target = target;
    this.status = status;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async render(): Promise<void> {
    return super.showTextOverMonster(this.target, "TODO " + this.status);
  }
  public applyAfterRender(): void {
    this.logger.info(`Apply ${this.status} to ${this.target.name}`);
    if (this.status === StatusContants.HASTE) {
      this.removeStatus(this.target, StatusContants.SLOW);
    }
    if (this.status === StatusContants.SLOW) {
      this.removeStatus(this.target, StatusContants.HASTE);
    }
    // TODO add duration
    this.target.statusAlterations.push(new StatusAlteration(this.status));
  }

  protected removeStatus(monster: Monster, remove: string): void {
    monster.statusAlterations = monster.statusAlterations.filter(
      (a) => a.status !== remove
    );
  }
}
