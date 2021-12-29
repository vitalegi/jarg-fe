import GameService from "@/services/GameService";
import Container from "typedi";
import * as PIXI from "pixi.js";

export default class AbilityName {
  protected label = "";
  protected options = {
    duration: 1000,
    x: 188,
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
    this.label = label;
  }

  public async execute(): Promise<void> {
    console.log(`Show ability ${this.label}`);
    const container = this.createText();
    this.getGameService().getApp().stage.addChild(container);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.getGameService().getApp().stage.removeChild(container);
        console.log(`Hide ability ${this.label}`);
        resolve();
      }, this.options.duration);
    });
  }

  protected createText(): PIXI.Container {
    const container = new PIXI.Container();
    container.x = this.options.x;
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
}
