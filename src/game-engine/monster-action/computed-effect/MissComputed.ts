import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class MissComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.MissComputed"
  );
  target;
  public constructor(target: Monster) {
    super();
    this.target = target;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async render(): Promise<void> {
    this.logger.info(`MissComputed: miss attack to ${this.target.name}`);
    return super.showTextOverMonster(this.target, "MISS");
  }
}
