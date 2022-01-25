import Monster from "@/game-engine/monster/Monster";
import ActionType from "./ActionType";
import { PerformedAction } from "./PerformedAction";

export default class HistoryTurn {
  monster: Monster;
  actionsHistory: PerformedAction[] = [];

  public constructor(monster: Monster) {
    this.monster = monster;
  }

  public getByTypes(types: ActionType[]): PerformedAction[] {
    return this.actionsHistory.filter((a) => types.find((t) => t === a.type));
  }
}
