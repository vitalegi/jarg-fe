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
    const timestamp = TimeUtil.timestamp();
    const stats = this.gameLoopHandlers
      .filter((h) => !h.completed())
      .map((h) => this.drawHandler(h));

    const duration = Math.round(100 * (TimeUtil.timestamp() - timestamp)) / 100;
    if (duration > 10) {
      this.logger.info(
        `MONITORING Drawers time_taken=${duration}ms. Split:\n${stats.join(
          "\n"
        )}`
      );
    }

    this.gameLoopHandlers = this.gameLoopHandlers.filter((h) => !h.completed());
  }

  protected drawHandler(handler: Drawer): string {
    const timestamp = TimeUtil.timestamp();
    try {
      handler.draw();
    } catch (e) {
      this.logger.error(
        `Error while rendering ${handler.getName()} (${handler.getId()})`,
        e
      );
    }
    const duration = Math.round(100 * (TimeUtil.timestamp() - timestamp)) / 100;
    return `Drawer id=${handler.getId()}, name=${handler.getName()}, time_taken=${duration}ms`;
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
