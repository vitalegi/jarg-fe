import GameService from "@/services/GameService";
import Container from "typedi";
import * as PIXI from "pixi.js";
import FrameImpl from "./FrameImpl";
import DetectEvent from "./DetectEvent";
import { TextStyle } from "pixi.js";

export class MenuEntry {
  label: string;
  action: () => void;
  enabled: boolean;

  public constructor(label: string, action: () => void, enabled = true) {
    this.label = label;
    this.action = action;
    this.enabled = enabled;
  }
}

export default class LeftMenu {
  protected container: PIXI.Container | null = null;
  protected gameService = Container.get<GameService>(GameService);
  protected entries: MenuEntry[] = [];
  protected frame: FrameImpl;

  protected options = {
    enabled: {
      font: {
        fontFamily: "Courier",
        fontSize: 20,
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      },
    },
    disabled: {
      font: {
        fontFamily: "Courier",
        fontSize: 20,
        fill: "#ffffff",
        stroke: "#999999",
        strokeThickness: 4,
      },
    },
    menuEntry: {
      height: 28,
      fill: 0xffffff,
    },
    width: 176,
  };

  public constructor(frame: FrameImpl = new FrameImpl()) {
    this.frame = frame;
  }

  public addEntry(entry: MenuEntry): void {
    this.entries.push(entry);
  }

  public draw(): void {
    this.container = new PIXI.Container();
    this.gameService.getApp().stage.addChild(this.container);

    this.container.addChild(
      this.frame.createFrame(
        0,
        0,
        this.menuWidth(),
        this.menuEntryHeight() * this.entries.length
      )
    );
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

  protected drawMenuEntry(entry: MenuEntry, index: number): void {
    const rectangle = new PIXI.Graphics();
    rectangle.beginFill(this.options.menuEntry.fill);

    rectangle.drawRect(
      this.frame.getWidth() + 2,
      this.menuEntryHeight() * index + this.frame.getWidth() + 3,
      this.menuWidth() - this.frame.getWidth(),
      this.menuEntryHeight() - this.frame.getWidth() - 3
    );
    rectangle.endFill();

    if (entry.enabled) {
      new DetectEvent(rectangle, () => entry.action());
    }
    this.container?.addChild(rectangle);

    const message = new PIXI.Text(entry.label, this.getMenuEntryFont(entry));
    message.position.x = this.frame.getWidth() + 4;
    message.position.y = this.menuEntryHeight() * index + 5;

    if (entry.enabled) {
      new DetectEvent(message, () => entry.action());
    }
    this.container?.addChild(message);
  }

  protected menuEntryHeight(): number {
    return this.options.menuEntry.height;
  }

  protected menuWidth(): number {
    return this.options.width;
  }

  protected getMenuEntryFont(entry: MenuEntry): Partial<TextStyle> {
    if (entry.enabled) {
      return this.options.enabled.font;
    }
    return this.options.disabled.font;
  }
}
