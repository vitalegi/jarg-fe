import Container from "typedi";
import * as PIXI from "pixi.js";
import TimeUtil from "@/utils/TimeUtil";
import LoggerFactory from "@/logger/LoggerFactory";
import FontService from "@/game-engine/ui/graphics/FontService";
import Drawer from "@/game-engine/ui/Drawer";
import GameApp from "@/game-engine/GameApp";

export default class AbilityNameDrawer extends Drawer {
  logger = LoggerFactory.getLogger("GameEngine.UI.AbilityNameDrawer");

  protected static NAME = "AbilityNameDrawer";
  protected fontService = Container.get<FontService>(FontService);
  protected gameApp = Container.get<GameApp>(GameApp);
  protected label = "";
  protected options = {
    duration: 1500,
    y: 4,
    text: {
      x: 3,
      y: 0,
      fontWidth: 20.2,
    },
    background: {
      width: 220,
      height: 35,
      fill: 0xffffff,
      style: { width: 4, color: 0x000000 },
    },
  };

  public constructor(label: string) {
    super();
    this.label = label;
  }

  public getName(): string {
    return "AbilityNameDrawer";
  }

  protected doDraw(): void {
    if (this.isFirstDraw()) {
      this.logger.debug(`Show ability ${this.label}`);
      this.gameApp.getApp().stage.addChild(this.createText());
    }
    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      this.logger.debug(`Remove ability ${this.label}`);

      const parent = this.gameApp.getApp().stage;
      const child = this.getChildContainer(parent, AbilityNameDrawer.NAME);
      parent.removeChild(child);
      this.complete();
    }
  }

  protected createText(): PIXI.Container {
    const container = new PIXI.Container();
    container.name = AbilityNameDrawer.NAME;

    const screenWidth = this.gameApp.getApp().view.width;
    container.x = screenWidth / 2 - this.frameWidth() / 2;
    container.y = this.options.y;

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle(this.options.background.style);
    rectangle.beginFill(this.options.background.fill);
    rectangle.drawRect(0, 0, this.frameWidth(), this.options.background.height);
    rectangle.endFill();
    container.addChild(rectangle);

    const message = new PIXI.Text(this.label, this.fontService.abilityName());
    message.position.x = this.options.text.x;
    message.position.y = this.options.text.y;
    container.addChild(message);

    return container;
  }

  protected frameWidth(): number {
    return this.options.text.fontWidth * this.label.length;
  }

  protected getBattleContainer(): PIXI.Container {
    return this.gameApp.getBattleContainer();
  }

  protected getChildContainer(
    parent: PIXI.Container,
    name: string
  ): PIXI.Container {
    const child = this.findChildContainer(parent, name);
    if (child) {
      return child;
    }
    throw Error(
      `Cannot find element ${name} in parent ${
        parent.name
      }. Children ${parent.children.map((c) => c.name).join(", ")}`
    );
  }
}
