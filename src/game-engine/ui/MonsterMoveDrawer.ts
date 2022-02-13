import Monster from "@/game-engine/model/monster/Monster";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import * as PIXI from "pixi.js";
import Point from "@/models/Point";
import Drawer from "@/game-engine/ui/Drawer";
import MapRepository from "@/game-engine/map/MapRepository";
import GameApp from "@/game-engine/GameApp";
import CoordinateService from "@/game-engine/CoordinateService";

export default class MonsterMoveDrawer extends Drawer {
  protected mapRepository = Container.get(MapRepository);
  protected gameApp = Container.get(GameApp);
  protected coordinateService = Container.get(CoordinateService);

  monster;
  from;
  to;

  options = {
    duration: 500,
    steps: 2,
  };

  public constructor(monster: Monster, from: Point, to: Point) {
    super();
    this.monster = monster;
    this.from = from;
    this.to = to;
  }

  public getName(): string {
    return "MonsterMoveDrawer";
  }

  protected doDraw(): void {
    const container = this.getMonsterContainer();
    if (!container) {
      this.complete();
      return;
    }

    const from = this.coordinateService.getTileCoordinates(this.from);
    const to = this.coordinateService.getTileCoordinates(this.to);

    const elapsedTime = TimeUtil.timestamp() - super.startTime();
    const stepDuration = this.options.duration / this.options.steps;
    const step = Math.floor(elapsedTime / stepDuration);

    const percentage = step / this.options.steps;

    container.x = percentage * (to.x - from.x) + from.x;
    container.y = percentage * (to.y - from.y) + from.y;

    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      container.x = to.x;
      container.y = to.y;
      this.complete();
    }
  }

  protected getMonsterContainer(): PIXI.Container | null {
    return this.findChildContainer(
      this.gameApp.getBattleContainer(),
      this.monster.uuid
    );
  }
}
