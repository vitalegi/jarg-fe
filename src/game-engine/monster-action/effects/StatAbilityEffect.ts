import Monster from "@/game-engine/monster/Monster";
import Statistics from "../Statistics";
import Effect, { EffectComputeType } from "./Effect";

export default class StatAbilityEffect extends Effect {
  stat: Statistics;
  type: EffectComputeType;
  value: number;

  public static fromJson(json: any): StatAbilityEffect {
    return new StatAbilityEffect(json.stat, json.type, json.value);
  }

  public constructor(stat: Statistics, type: EffectComputeType, value: number) {
    super();
    this.stat = stat;
    this.type = type;
    this.value = value;
  }
  apply(monster: Monster): void {
    const value = this.getValue(monster, this.stat);
    const newValue = this.getNewValue(value);
    this.setValue(monster, this.stat, newValue);
  }

  textualEffect(monster: Monster): string {
    const value = this.getValue(monster, this.stat);
    const newValue = this.getNewValue(value);
    const diff = newValue - value;
    return `${diff} ${this.stat.toUpperCase()}`;
  }

  protected getNewValue(originalValue: number): number {
    if (this.type === "abs") {
      return Math.round(originalValue + this.value);
    }
    if (this.type === "percentage") {
      return Math.round(originalValue * (1 + this.value));
    }
    throw new Error(`Unknown type ${this.type}`);
  }
}
