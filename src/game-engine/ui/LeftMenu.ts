import GameService from "@/services/GameService";
import Container from "typedi";
import * as PIXI from "pixi.js";

export class MenuEntry {
  label: string;
  action: () => void;

  public constructor(label: string, action: () => void) {
    this.label = label;
    this.action = action;
  }
}

export default class LeftMenu {
  protected container: PIXI.Container | null = null;
  protected gameService = Container.get<GameService>(GameService);
  protected entries: MenuEntry[] = [];

  protected options = {
    frame: { style: { width: 4, color: 0x000000 }, background: 0xffffff },
    font: {
      fontFamily: "Courier",
      fontSize: 20,
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    },
    menuEntry: {
      height: 28,
      fill: 0xffffff,
    },
    width: 176,
  };

  public addEntry(entry: MenuEntry): void {
    this.entries.push(entry);
  }

  public draw(): void {
    this.container = new PIXI.Container();
    this.gameService.getApp().stage.addChild(this.container);

    this.drawMenuBackground();
    this.entries.forEach((entry: MenuEntry, index: number) => {
      this.drawMenuEntry(entry, index);
    });
  }

  public destroy(): void {
    if (this.container) {
      this.gameService.getApp().stage.removeChild(this.container);
    }
  }

  public show(): void {
    if (this.container) {
      this.container.visible = true;
    }
  }
  public hide(): void {
    if (this.container) {
      this.container.visible = false;
    }
  }

  protected drawMenuBackground(): void {
    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle(this.options.frame.style);
    rectangle.beginFill(this.options.frame.background);
    const frameWidth = this.options.frame.style.width;
    rectangle.drawRect(
      frameWidth,
      frameWidth,
      this.menuWidth() + frameWidth,
      this.menuEntryHeight() * this.entries.length + frameWidth
    );
    rectangle.endFill();
    rectangle.interactive = true;
    this.container?.addChild(rectangle);
  }

  protected drawMenuEntry(entry: MenuEntry, index: number): void {
    const rectangle = new PIXI.Graphics();
    rectangle.beginFill(this.options.menuEntry.fill);
    const frameWidth = this.options.frame.style.width;

    rectangle.drawRect(
      frameWidth + 2,
      this.menuEntryHeight() * index + frameWidth + 3,
      this.menuWidth() - frameWidth,
      this.menuEntryHeight() - frameWidth - 3
    );
    rectangle.endFill();
    rectangle.interactive = true;
    rectangle.on("pointertap", () => entry.action());
    this.container?.addChild(rectangle);

    const message = new PIXI.Text(entry.label, this.options.font);
    message.position.x = this.options.frame.style.width + 4;
    message.position.y = this.menuEntryHeight() * index + 5;

    message.interactive = true;
    message.on("pointertap", () => entry.action());

    this.container?.addChild(message);
  }

  protected menuEntryHeight(): number {
    return this.options.menuEntry.height;
  }

  protected menuWidth(): number {
    return this.options.width;
  }
}
