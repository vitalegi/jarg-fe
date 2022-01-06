import Monster from "@/game-engine/monster/Monster";
import Ability from "../../Ability";

export default abstract class Condition {
  public abstract clone(): Condition;
  public abstract getName(): string;
  public abstract accept(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): boolean;
}
