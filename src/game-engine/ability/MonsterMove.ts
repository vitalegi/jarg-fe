import Monster from "@/game-engine/model/monster/Monster";
import Container from "typedi";
import Point from "@/models/Point";
import LoggerFactory from "@/logger/LoggerFactory";
import GameLoop from "@/game-engine/GameLoop";
import HistoryRepository from "@/game-engine/battle/turns/HistoryRepository";
import MonsterMoveDrawer from "@/game-engine/ui/MonsterMoveDrawer";
export default class MonsterMove {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.MonsterMove");
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected historyRepository =
    Container.get<HistoryRepository>(HistoryRepository);

  protected source;
  protected path;

  public constructor(source: Monster, path: Point[]) {
    this.source = source;
    this.path = path;
  }

  public async execute(): Promise<void> {
    this.historyRepository.moves(this.path);
    this.logger.debug(
      `Path ${this.path}, starting from: ${this.source.coordinates}`
    );
    for (let i = 0; i < this.path.length - 1; i++) {
      const from = this.path[i];
      const to = this.path[i + 1];
      this.logger.debug(`Walk from ${from} to ${to}`);
      const drawer = new MonsterMoveDrawer(this.source, from, to);
      this.gameLoop.addGameLoopHandler(drawer);
      await drawer.notifyWhenCompleted();
      this.source.coordinates = to.clone();
    }
  }
}
