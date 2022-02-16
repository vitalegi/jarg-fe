import ComputedEffect from "@/game-engine/ability/computed-effect/ComputedEffect";
import Condition from "@/game-engine/ability/effects/condition/Condition";
import ConditionFactory from "@/game-engine/ability/effects/condition/ConditionFactory";
import Duration from "@/game-engine/ability/effects/duration/Duration";
import DurationFactory from "@/game-engine/ability/effects/duration/DurationFactory";
import { FixedDuration } from "@/game-engine/ability/effects/duration/FixedDuration";
import { Immediate } from "@/game-engine/ability/effects/duration/Immediate";
import { RandomDuration } from "@/game-engine/ability/effects/duration/RandomDuration";
import Target from "@/game-engine/ability/effects/target/Target";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";

export type EffectComputeType = "percentage" | "abs";

export default abstract class Effect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.Effects.Effect.Effect"
  );
  type;
  target = new Target();
  conditions: Condition[] = [];
  duration: Duration = new Immediate();

  public constructor(type: string) {
    this.type = type;
  }

  public static fromJson(effect: Effect, json: any): void {
    effect.target = Target.fromJson(json.target);
    if (json.conditions) {
      effect.conditions = json.conditions.map(ConditionFactory.fromJson);
    }
    effect.duration = DurationFactory.fromJson(json.duration);
  }

  public abstract clone(): Effect;
  public abstract toJson(): any;
  public abstract summary(): string;

  public supportedDurations(): string[] {
    return [Immediate.TYPE, FixedDuration.TYPE, RandomDuration.TYPE];
  }

  public hash(): string {
    return JSON.stringify(this.toJson());
  }

  public validate(): void {
    this.target.validate();
    this.conditions.forEach((c) => c.validate());
    this.duration.validate();
    this.doValidate();
  }
  protected abstract doValidate(): void;

  protected _clone(obj: Effect): void {
    obj.type = this.type;
    obj.target = this.target.clone();
    obj.conditions = this.conditions.map((c) => c.clone());
    obj.duration = this.duration.clone();
  }

  protected _toJson(obj: any): void {
    obj.target = this.target.toJson();
    obj.conditions = this.conditions.map((c) => c.toJson());
    obj.duration = this.duration.toJson();
    obj.type = this.type;
  }

  protected conditionsSummary(): string {
    return `${this.conditions.map((c) => c.summary()).join(" and ")}`;
  }

  abstract apply(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): ComputedEffect[];

  protected passConditions(
    source: Monster,
    effectTarget: Monster,
    ability: Ability,
    hit: boolean
  ): boolean {
    const notPassed = this.conditions.filter(
      (condition) => !condition.accept(source, effectTarget, ability, hit)
    );
    const pass = notPassed.length === 0;
    if (!pass) {
      this.logger.info(
        `Condition not met: ${notPassed.map((c) => c.toString()).join(", ")}`
      );
    }
    return pass;
  }
}
