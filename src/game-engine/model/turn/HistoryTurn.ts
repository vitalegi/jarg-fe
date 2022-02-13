import ActionType from "@/game-engine/model/turn/ActionType";
import { PerformedAction } from "@/game-engine/model/turn/PerformedAction";
import Monster from "@/game-engine/model/monster/Monster";
import UuidUtil from "@/utils/UuidUtil";

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
