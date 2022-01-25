import Container from "typedi";
import * as PIXI from "pixi.js";
import FrameImpl from "./FrameImpl";
import DetectEvent from "./DetectEvent";
import { TextStyle } from "pixi.js";
import GameApp from "../GameApp";
import FontService from "./FontService";
import UuidUtil from "@/utils/UuidUtil";
import LoggerFactory from "@/logger/LoggerFactory";

export class MenuEntry {
  label: string;
  action: () => void;
  enabled: () => boolean;

  public constructor(
    label: string,
    action: () => void,
    enabled: () => boolean
  ) {
    this.label = label;
    this.action = action;
    this.enabled = enabled;
  }

  public static alwaysEnabled(
    label: string,
    action: () => void = () => {
      return;
    }
  ): MenuEntry {
    return new MenuEntry(label, action, () => true);
  }
}

export default class LeftMenu {
  logger = LoggerFactory.getLogger("GameEngine.UI.LeftMenu");
  private static NAME = "LeftMenu";

  protected fontService = Container.get<FontService>(FontService);

  protected container: PIXI.Container | null = null;
  protected gameApp = Container.get<GameApp>(GameApp);
  protected entries: MenuEntry[] = [];
  protected frame: FrameImpl;

  protected options = {
    menuEntry: {
      height: 28,
      fill: 0xffffff,
    },
    width: 176,
  };

  public constructor(frame: FrameImpl = new FrameImpl()) {
    this.frame = frame;
  }

  public destroy(): void {
    const gameApp = Container.get<GameApp>(GameApp);
    if (this.container) {
      gameApp.getApp().stage.removeChild(this.container);
    }
  }

  public addEntry(entry: MenuEntry): void {
    this.entries.push(entry);
  }

  public draw(): void {
    this.container = new PIXI.Container();
    this.container.name = `${LeftMenu.NAME}_${UuidUtil.nextId()}`;
    this.logger.debug(`Draw menu ${this.container.name}`);

    this.gameApp.getApp().stage.addChild(this.container);

    const runningMenus = this.gameApp
      .getApp()
      .stage.children.filter((c) => c.name.startsWith(LeftMenu.NAME));
    if (runningMenus.length > 1) {
      this.logger.debug(`MONITORING, LeftMenus: ${runningMenus.length}`);
    }

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
  public reDraw(): void {
    this.destroy();
    this.draw();
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

    if (entry.enabled()) {
      new DetectEvent(rectangle, () => entry.action());
    }
    this.container?.addChild(rectangle);

    const message = new PIXI.Text(entry.label, this.getMenuEntryFont(entry));
    message.position.x = this.frame.getWidth() + 4;
    message.position.y = this.menuEntryHeight() * index + 5;

    if (entry.enabled()) {
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
    if (entry.enabled()) {
      return this.fontService.leftMenuEnabled();
    }
    return this.fontService.leftMenuDisabled();
  }
}
