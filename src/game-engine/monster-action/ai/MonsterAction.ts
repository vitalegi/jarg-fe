import Monster from "@/game-engine/monster/Monster";
import Point from "@/models/Point";
import Ability from "../Ability";

export default class MonsterAction {
  from;
  ability;
  target;
  score = 0;
  scores: number[] = [];

  public constructor(from: Point, ability: Ability, target: Monster) {
    this.from = from;
    this.ability = ability;
    this.target = target;
  }

  public equals(other: MonsterAction): boolean {
    return (
      this.from.equals(other.from) &&
      this.ability.id === other.ability.id &&
      this.target.uuid === other.target.uuid
    );
  }
}
