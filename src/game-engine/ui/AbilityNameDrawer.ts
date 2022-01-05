import Container from "typedi";
import * as PIXI from "pixi.js";
import Drawer from "./Drawer";
import TimeUtil from "@/utils/TimeUtil";
import GameApp from "../GameApp";

export default class AbilityNameDrawer extends Drawer {
  protected static NAME = "AbilityNameDrawer";
  protected gameApp = Container.get<GameApp>(GameApp);
  protected label = "";
  protected options = {
    duration: 1500,
    y: 4,
    text: {
      x: 3,
      y: 0,
      font: {
        fontFamily: "Courier",
        fontSize: 32,
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      },
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
      console.log(`Show ability ${this.label}`);
      this.gameApp.getApp().stage.addChild(this.createText());
    }
    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      console.log(`Remove ability ${this.label}`);

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

    const message = new PIXI.Text(this.label, this.options.text.font);
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
