import Monster from "@/game-engine/monster/Monster";
import UuidUtil from "@/utils/UuidUtil";
import Ability from "../../ability/Ability";

export default abstract class Condition {
  id = UuidUtil.nextId();
  type = "";
  public abstract clone(): Condition;
  public abstract toJson(): any;
  public abstract getName(): string;
  public abstract accept(
    source: Monster,
    target: Monster,
    ability: Ability,
    hit: boolean
  ): boolean;
  public abstract summary(): string;
}
