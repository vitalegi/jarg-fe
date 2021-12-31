import GameService from "@/services/GameService";
import Container from "typedi";
import * as PIXI from "pixi.js";
import Drawer from "./Drawer";
import TimeUtil from "@/utils/TimeUtil";
import Point from "@/models/Point";

export default class AbilityNameDrawer extends Drawer {
  protected static NAME = "AbilityNameDrawer";

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

  protected getName(): string {
    return "AbilityNameDrawer";
  }

  public doDraw(): void {
    if (this.isFirstDraw()) {
      console.log(`Show ability ${this.label}`);
      this.getGameService().getApp().stage.addChild(this.createText());
    }
    if (TimeUtil.timestamp() - this.startTime() >= this.options.duration) {
      console.log(`Remove ability ${this.label}`);

      const parent = this.getGameService().getApp().stage;
      const child = this.getGameService().getChildContainer(
        parent,
        AbilityNameDrawer.NAME
      );
      parent.removeChild(child);
      this.complete();
    }
  }

  protected createText(): PIXI.Container {
    const container = new PIXI.Container();
    container.name = AbilityNameDrawer.NAME;

    const screenWidth = this.getGameService().getApp().view.width;
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

  protected getGameService(): GameService {
    return Container.get<GameService>(GameService);
  }

  protected frameWidth(): number {
    return this.options.text.fontWidth * this.label.length;
  }

  protected getBattleContainer(): PIXI.Container {
    return this.getGameService().getBattleContainer();
  }
}
