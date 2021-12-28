import { Monster } from "@/models/Character";

type Statistic = "hp" | "atk" | "def";

type EffectComputeType = "percentage" | "abs";

export default abstract class ActionEffect {
  abstract apply(monster: Monster): void;
}

export class StatActionEffect extends ActionEffect {
  stat: Statistic;
  type: EffectComputeType;
  value: number;

  public static fromJson(json: any): StatActionEffect {
    return new StatActionEffect(json.stat, json.type, json.value);
  }

  public constructor(stat: Statistic, type: EffectComputeType, value: number) {
    super();
    this.stat = stat;
    this.type = type;
    this.value = value;
  }
  apply(monster: Monster): void {
    const value = this.getOriginalValue(monster);
    const newValue = this.getNewValue(value);
    this.setValue(monster, newValue);
  }

  protected getOriginalValue(monster: Monster): number {
    if (this.stat === "hp") {
      return monster.stats.hp;
    }
    if (this.stat === "atk") {
      return monster.stats.atk;
    }
    if (this.stat === "def") {
      return monster.stats.def;
    }
    throw new Error(`Unknown stat ${this.stat}`);
  }

  protected setValue(monster: Monster, value: number): void {
    if (this.stat === "hp") {
      monster.stats.hp = value;
    }
    if (this.stat === "atk") {
      monster.stats.atk = value;
    }
    if (this.stat === "def") {
      monster.stats.def = value;
    }
  }

  protected getNewValue(originalValue: number): number {
    if (this.type === "abs") {
      return originalValue + this.value;
    }
    if (this.type === "percentage") {
      return originalValue * (1 + this.value);
    }
    throw new Error(`Unknown type ${this.type}`);
  }
}
