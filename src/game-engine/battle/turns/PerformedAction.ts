import Ability from "@/game-engine/monster-action/ability/Ability";
import Point from "@/models/Point";
import UuidUtil from "@/utils/UuidUtil";
import ActionType from "./ActionType";

export class PerformedAction {
  id = UuidUtil.nextId();
  type: ActionType;
  source: Point | null = null;
  dest: Point | null = null;
  distance = 0;
  ability: Ability | null = null;

  public constructor(type: ActionType) {
    this.type = type;
  }

  public static move(
    source: Point,
    dest: Point,
    distance: number
  ): PerformedAction {
    const t = new PerformedAction(ActionType.MOVE);
    t.source = source;
    t.dest = dest;
    t.distance = distance;
    return t;
  }

  public static ability(ability: Ability): PerformedAction {
    const t = new PerformedAction(ActionType.ABILITY);
    t.ability = ability;
    return t;
  }
  public static catchMonster(): PerformedAction {
    return new PerformedAction(ActionType.CATCH);
  }
}
