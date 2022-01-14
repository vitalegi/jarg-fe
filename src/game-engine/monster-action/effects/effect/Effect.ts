import Monster from "@/game-engine/monster/Monster";
import LoggerFactory from "@/logger/LoggerFactory";
import UuidUtil from "@/utils/UuidUtil";
import Ability from "../../Ability";
import ComputedEffect from "../../computed-effect/ComputedEffect";
import Condition from "../condition/Condition";
import ConditionFactory from "../condition/ConditionFactory";
import Target from "../target/Target";

export type EffectComputeType = "percentage" | "abs";

export default abstract class Effect {
  logger = LoggerFactory.getLogger(
    "GameEngine.MonsterAction.Effects.Effect.Effect"
  );
  id = UuidUtil.nextId();
  type;
  target = new Target();
  conditions: Condition[] = [];

  public constructor(type: string) {
    this.type = type;
  }

  public static fromJson(effect: Effect, json: any): void {
    if (json.id) {
      effect.id = json.id;
    }
    effect.target = Target.fromJson(json.target);
    if (json.conditions) {
      effect.conditions = json.conditions.map(ConditionFactory.fromJson);
    }
  }

  public abstract clone(): Effect;
  public abstract toJson(): any;
  public abstract summary(): string;

  protected _clone(obj: Effect): void {
    obj.id = this.id;
    obj.target = this.target.clone();
    obj.conditions = this.conditions.map((c) => c.clone());
  }

  protected _toJson(obj: any): void {
    obj.id = this.id;
    obj.target = this.target.toJson();
    obj.conditions = this.conditions.map((c) => c.toJson());
  }

  protected _summary(): string {
    return `if ${this.conditions.map((c) => c.summary()).join(" and ")}, then`;
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
