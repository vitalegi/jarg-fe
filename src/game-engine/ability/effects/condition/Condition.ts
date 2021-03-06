import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/model/monster/Monster";

export default abstract class Condition {
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

  public validate(): void {
    this.doValidate();
  }

  protected abstract doValidate(): void;
}
