import Monster from "@/game-engine/monster/Monster";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import HealthBarService from "../monster/HealthBarService";
import MapRepository from "../map/MapRepository";
import GameApp from "../GameApp";

export default class HealthBarUpdateDrawer extends Drawer {
  protected mapRepository = Container.get<MapRepository>(MapRepository);
  protected gameApp = Container.get<GameApp>(GameApp);
  protected healthBarService =
    Container.get<HealthBarService>(HealthBarService);

  monster;
  from;
  to;

  options = {
    duration: 700,
    steps: 40,
  };

  public constructor(monster: Monster, from: number, to: number) {
    super();
    this.monster = monster;
    this.from = from;
    this.to = to;
  }

  public getName(): string {
    return "HealthBarUpdateDrawer";
  }

  protected doDraw(): void {
    const container = this.getMonsterContainer();
    if (!container) {
      this.complete();
      return;
    }

    const elapsedTime = TimeUtil.timestamp() - super.startTime();
    const stepDuration = this.options.duration / this.options.steps;
    const step = Math.floor(elapsedTime / stepDuration);

    const percentage = step / this.options.steps;

    const hp = percentage * (this.to - this.from) + this.from;

    this.healthBarService.updateBar(container, this.monster, hp);

    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      this.healthBarService.updateBar(container, this.monster, this.to);
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
