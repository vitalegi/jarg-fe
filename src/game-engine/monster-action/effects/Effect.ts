import Monster from "@/game-engine/monster/Monster";
import Statistics from "../Statistics";
import Target from "./target/Target";

export type EffectComputeType = "percentage" | "abs";

export default abstract class Effect {
  target = new Target();

  public static fromJson(effect: Effect, json: any): void {
    effect.target = Target.fromJson(json.target);
  }

  abstract apply(monster: Monster): void;

  abstract textualEffect(monster: Monster): string;

  protected getValue(monster: Monster, stat: Statistics): number {
    if (stat === "hp") {
      return monster.stats.hp;
    }
    if (stat === "atk") {
      return monster.stats.atk;
    }
    if (stat === "def") {
      return monster.stats.def;
    }
    throw new Error(`Unknown stat ${stat}`);
  }

  protected setValue(monster: Monster, stat: Statistics, value: number): void {
    if (stat === "hp") {
      monster.stats.hp = value;
    }
    if (stat === "atk") {
      monster.stats.atk = value;
    }
    if (stat === "def") {
      monster.stats.def = value;
    }
  }
}
