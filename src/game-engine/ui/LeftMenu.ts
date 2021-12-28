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
    this.container?.addChild(rectangle);
  }

  protected drawMenuEntry(entry: MenuEntry, index: number): void {
    const message = new PIXI.Text(entry.label, {
      fontFamily: "Courier",
      fontSize: 36,
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    });
    message.position.x = this.options.frame.style.width + 2;
    message.position.y = this.menuEntryHeight() * index;

    this.container?.addChild(message);
  }

  protected menuEntryHeight(): number {
    return 40;
  }

  protected menuWidth(): number {
    return 178;
  }
}
