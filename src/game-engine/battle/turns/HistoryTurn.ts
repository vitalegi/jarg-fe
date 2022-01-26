import Monster from "@/game-engine/monster/Monster";
import UuidUtil from "@/utils/UuidUtil";
import ActionType from "./ActionType";
import { PerformedAction } from "./PerformedAction";

export default class HistoryTurn {
  id = UuidUtil.nextId();
  monster: Monster;
  actionsHistory: PerformedAction[] = [];

  public constructor(monster: Monster) {
    this.monster = monster;
  }

  public getByTypes(types: ActionType[]): PerformedAction[] {
    return this.actionsHistory.filter((a) => types.find((t) => t === a.type));
  }

  public hash(): string {
    if (this.actionsHistory.length > 0) {
      const actionHash = this.actionsHistory[this.actionsHistory.length - 1].id;
      return `${this.id}_${actionHash}`;
    }
    return this.id;
  }
}
