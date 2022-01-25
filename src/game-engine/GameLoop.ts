import LoggerFactory from "@/logger/LoggerFactory";
import TimeUtil from "@/utils/TimeUtil";
import { Service } from "typedi";
import Drawer from "./ui/Drawer";
import MonsterAnimationDrawer from "./ui/MonsterAnimationDrawer";

@Service()
export default class GameLoop {
  logger = LoggerFactory.getLogger("GameEngine.GameEngine");

  protected gameLoopHandlers: Drawer[] = [];

  public removeAll(): void {
    this.logger.info(`Remove all game loop handlers`);
    this.gameLoopHandlers = [];
  }

  public gameLoop(): void {
    const notCompleted = this.gameLoopHandlers.filter((h) => !h.completed());
    TimeUtil.monitor(
      `Drawers ${notCompleted.length}`,
      () => notCompleted.map((h) => this.drawHandler(h)),
      20
    );
    this.gameLoopHandlers = this.gameLoopHandlers.filter((h) => !h.completed());
  }

  protected drawHandler(handler: Drawer): void {
    try {
      TimeUtil.monitor(
        `${handler.getId()}_${handler.getName()}`,
        () => handler.draw(),
        10
      );
    } catch (e) {
      this.logger.error(
        `Error while rendering ${handler.getName()} (${handler.getId()})`,
        e
      );
    }
  }

  public addGameLoopHandler(drawer: Drawer): void {
    this.gameLoopHandlers.push(drawer);
  }

  public getMonsterAnimationDrawer(): MonsterAnimationDrawer {
    return this.gameLoopHandlers.filter(
      (h) => h.getName() === MonsterAnimationDrawer.NAME
    )[0] as MonsterAnimationDrawer;
  }
}
