import { Monster } from "@/models/Character";
import GameService from "@/services/GameService";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import Point from "@/models/Point";
import CoordinateService from "../CoordinateService";

export default class MonsterMoveDrawer extends Drawer {
  protected gameService = Container.get<GameService>(GameService);
  protected coordinateService =
    Container.get<CoordinateService>(CoordinateService);

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

    const from = this.coordinateService.getTileCoordinates(
      this.from,
      this.gameService.getMap().options
    );
    const to = this.coordinateService.getTileCoordinates(
      this.to,
      this.gameService.getMap().options
    );

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
    return this.gameService.findChildContainer(
      this.gameService.getBattleContainer(),
      this.monster.uuid
    );
  }
}
