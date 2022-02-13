import Monster from "@/game-engine/model/monster/Monster";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import * as PIXI from "pixi.js";
import Drawer from "@/game-engine/ui/Drawer";
import MapRepository from "@/game-engine/map/MapRepository";
import GameApp from "@/game-engine/GameApp";
import HealthBarService from "@/game-engine/monster/HealthBarService";
import GameLoop from "@/game-engine/GameLoop";

export default class HealthBarUpdateDrawer extends Drawer {
  protected mapRepository = Container.get(MapRepository);
  protected gameApp = Container.get(GameApp);
  protected healthBarService = Container.get(HealthBarService);

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

  public static async changeHealth(
    monster: Monster,
    fromHP: number,
    toHP: number
  ): Promise<void> {
    const healthUpdater = new HealthBarUpdateDrawer(monster, fromHP, toHP);
    Container.get(GameLoop).addGameLoopHandler(healthUpdater);
    return healthUpdater.notifyWhenCompleted();
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
