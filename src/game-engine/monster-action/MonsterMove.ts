import Monster from "@/game-engine/monster/Monster";
import Container from "typedi";
import Point from "@/models/Point";
import MonsterMoveDrawer from "../ui/MonsterMoveDrawer";
import GameLoop from "../GameLoop";
import TurnManager from "../battle/TurnManager";
import LoggerFactory from "@/logger/LoggerFactory";

export default class MonsterMove {
  logger = LoggerFactory.getLogger("GameEngine.MonsterAction.MonsterMove");
  protected gameLoop = Container.get<GameLoop>(GameLoop);
  protected turnManager = Container.get<TurnManager>(TurnManager);

  protected source;
  protected path;

  public constructor(source: Monster, path: Point[]) {
    this.source = source;
    this.path = path;
  }

  public async execute(): Promise<void> {
    const activeCharacter = this.turnManager.activeCharacter();
    if (activeCharacter) {
      activeCharacter.moves(this.path);
    }

    this.logger.info(
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
