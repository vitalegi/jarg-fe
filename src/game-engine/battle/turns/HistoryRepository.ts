import HistoryTurn from "@/game-engine/battle/turns/HistoryTurn";
import { PerformedAction } from "@/game-engine/battle/turns/PerformedAction";
import Ability from "@/game-engine/model/ability/Ability";
import Monster from "@/game-engine/monster/Monster";
import Point from "@/models/Point";
import { Service } from "typedi";

@Service()
export default class HistoryRepository {
  protected history: HistoryTurn[] = [];

  public removeAll(): void {
    this.history = [];
  }

  public startTurn(monster: Monster): void {
    this.history.push(new HistoryTurn(monster));
  }

  public addToCurrent(action: PerformedAction): void {
    this.getCurrent().actionsHistory.push(action);
  }

  public moves(path: Point[]): void {
    this.addToCurrent(
      PerformedAction.move(path[0], path[path.length - 1], path.length - 1)
    );
  }
  public usesAbility(ability: Ability): void {
    this.addToCurrent(PerformedAction.ability(ability));
  }
  public catchMonster(): void {
    this.addToCurrent(PerformedAction.catchMonster());
  }

  public getCurrent(): HistoryTurn {
    if (this.history.length === 0) {
      throw Error(`No history elements`);
    }
    return this.history[this.history.length - 1];
  }

  public isEmpty(): boolean {
    return this.history.length === 0;
  }
}
