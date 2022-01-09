import Monster from "@/game-engine/monster/Monster";
import StatAlteration from "@/game-engine/monster/stats/StatAlteration";
import LoggerFactory from "@/logger/LoggerFactory";
import ComputedEffect from "./ComputedEffect";

export default class StatChangeComputed extends ComputedEffect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.ComputedEffect.StatChangeComputed"
  );

  target;
  stat;
  percentage;

  public constructor(target: Monster, stat: string, percentage: number) {
    super();
    this.target = target;
    this.stat = stat;
    this.percentage = percentage;
  }

  public hasEffectOn(monster: Monster): boolean {
    return monster.uuid === this.target.uuid;
  }

  public async render(): Promise<void> {
    return super.showTextOverMonster(
      this.target,
      "TODO " + this.percentage + " " + this.stat
    );
  }
  public applyAfterRender(): void {
    this.logger.info(
      `Vary by ${this.percentage * 100}% ${this.stat} of ${this.target.name}`
    );
    // TODO add duration
    this.target.statsAlterations.push(
      new StatAlteration(this.stat, this.percentage)
    );
  }
}
