import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import * as PIXI from "pixi.js";
import Point from "@/models/Point";
import Drawer from "@/game-engine/ui/Drawer";
import MapRepository from "@/game-engine/map/MapRepository";
import WindowSizeProxy from "@/game-engine/WindowSizeProxy";
import CoordinateService from "@/game-engine/CoordinateService";
import GameApp from "@/game-engine/GameApp";
import GameConfig from "@/game-engine/GameConfig";

export default class ChangeFocusDrawer extends Drawer {
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);
  protected gameApp = Container.get<GameApp>(GameApp);

  target;
  startingOffset: Point | null = null;
  options = {
    duration: 1000,
  };

  public constructor(target: Point) {
    super();
    this.target = target;
  }

  public getName(): string {
    return "ChangeFocusDrawer";
  }

  protected doDraw(): void {
    const container = this.getContainer();

    if (this.startingOffset === null) {
      this.startingOffset = new Point(container.x, container.y).clone();
    }

    const tilePosition = this.coordinateService.getTileCoordinates(this.target);

    const screen = new Point(
      this.windowSizeProxy.width(),
      this.windowSizeProxy.height()
    );

    const targetOffset = new Point(
      this.targetOffset(screen.x, tilePosition.x, GameConfig.SHARED.tile.width),
      this.targetOffset(screen.y, tilePosition.y, GameConfig.SHARED.tile.height)
    );

    const elapsedTime = TimeUtil.timestamp() - super.startTime();
    const percentage = elapsedTime / this.options.duration;

    container.x =
      percentage * (targetOffset.x - this.startingOffset.x) +
      this.startingOffset.x;

    container.y =
      percentage * (targetOffset.y - this.startingOffset.y) +
      this.startingOffset.y;

    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      container.x = targetOffset.x;
      container.y = targetOffset.y;
      this.complete();
    }
  }

  protected getContainer(): PIXI.Container {
    return this.gameApp.getBattleContainer();
  }

  protected targetOffset(
    screen: number,
    tilePosition: number,
    tileSize: number
  ): number {
    return screen / 2 - tilePosition - tileSize / 2;
  }
}
