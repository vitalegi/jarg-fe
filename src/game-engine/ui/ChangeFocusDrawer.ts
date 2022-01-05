import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import Point from "@/models/Point";
import CoordinateService from "../CoordinateService";
import MapRepository from "../map/MapRepository";
import GameApp from "../GameApp";

export default class ChangeFocusDrawer extends Drawer {
  protected mapRepository = Container.get<MapRepository>(MapRepository);
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

    const tilePosition = this.coordinateService.getTileCoordinates(
      this.target,
      this.mapRepository.getMap().options
    );

    // TODO replace with WindowSizeProxy
    const screen = new Point(
      this.gameApp.getApp().view.width,
      this.gameApp.getApp().view.height
    );

    const targetOffset = new Point(
      this.targetOffset(
        screen.x,
        tilePosition.x,
        this.mapRepository.getMap().options.tileWidth
      ),
      this.targetOffset(
        screen.y,
        tilePosition.y,
        this.mapRepository.getMap().options.tileHeight
      )
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
