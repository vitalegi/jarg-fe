import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import Drawer from "../Drawer";
import * as PIXI from "pixi.js";
import GameApp from "../../GameApp";
import WindowSizeProxy from "@/game-engine/WindowSizeProxy";
import CONFIG from "@/assets/transitions/squared-transition-config.json";
import NumberUtil from "@/utils/NumberUtil";
import LoggerFactory from "@/logger/LoggerFactory";

export default class SquaredTransitionDrawer extends Drawer {
  logger = LoggerFactory.getLogger(
    "GameEngine.UI.SceneTransition.SquaredTransitionDrawer"
  );
  protected gameApp = Container.get<GameApp>(GameApp);
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);

  protected container;

  public constructor() {
    super();
    this.container = new PIXI.Container();
  }

  public getName(): string {
    return "SquaredTransitionDrawer";
  }

  protected doDraw(): void {
    if (this.isFirstDraw()) {
      this.gameApp.getApp().stage.addChild(this.container);
    }
    const elapsedTime = TimeUtil.timestamp() - this.startTime();
    let percentage = elapsedTime / CONFIG.duration;
    if (percentage > 1) {
      percentage = 1;
    }
    const totalSteps = CONFIG.steps.length;

    const lastStep = Math.round(percentage * totalSteps);
    const w = this.windowSizeProxy.width();
    const h = this.windowSizeProxy.height();
    this.logger.debug(
      `percentage: ${Math.round(100 * percentage)}, step: ${lastStep}`
    );
    for (let stepId = 0; stepId < lastStep; stepId++) {
      const step = CONFIG.steps[stepId];
      const name = `${step.x}_${step.y}`;
      if (!this.container.getChildByName(name)) {
        this.logger.debug(`Step ${step.x}, ${step.y} is new`);
        const rect = this.createRectangle();
        rect.x = step.x * Math.floor(w / this.horizontalSteps());
        rect.y = step.y * Math.floor(h / this.verticalSteps());
        rect.name = name;
        this.container.addChild(rect);
      }
    }
    if (percentage >= 1) {
      this.complete();
    }
  }

  protected createRectangle(): PIXI.Graphics {
    const rectangle = new PIXI.Graphics();

    rectangle.beginFill(CONFIG.color);
    rectangle.drawRect(0, 0, this.rectWidth(), this.rectHeight());
    rectangle.endFill();
    return rectangle;
  }

  protected rectWidth(): number {
    const w = this.windowSizeProxy.width();
    return Math.ceil(w / this.horizontalSteps()) + 1;
  }
  protected rectHeight(): number {
    const h = this.windowSizeProxy.height();
    return Math.ceil(h / this.verticalSteps()) + 1;
  }

  protected horizontalSteps(): number {
    return 1 + NumberUtil.max(CONFIG.steps.map((p) => p.x));
  }
  protected verticalSteps(): number {
    return 1 + NumberUtil.max(CONFIG.steps.map((p) => p.y));
  }
}