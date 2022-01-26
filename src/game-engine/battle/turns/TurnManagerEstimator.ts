import Container, { Service } from "typedi";
import HistoryRepository from "./HistoryRepository";
import Tick from "./Tick";
import TurnManager from "./TurnManager";

@Service()
export default class TurnManagerEstimator {
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected historyRepository =
    Container.get<HistoryRepository>(HistoryRepository);

  protected cache: Tick[] = [];
  protected lastHash = "";

  public changed(): boolean {
    if (this.historyRepository.isEmpty()) {
      this.cache = this.turnManager.getTurns(10);
      return true;
    }
    const hash = this.historyRepository.getCurrent().hash();
    if (this.lastHash !== hash) {
      this.lastHash = hash;
      this.cache = this.turnManager.getTurns(10);
      return true;
    }
    return false;
  }

  public estimation(): Tick[] {
    return this.cache;
  }
}
