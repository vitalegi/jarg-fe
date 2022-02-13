import GameApp from "@/game-engine/GameApp";
import MapRepository from "@/game-engine/map/MapRepository";
import DetectEvent from "@/game-engine/ui/DetectEvent";
import Drawer from "@/game-engine/ui/Drawer";
import DisplayObj from "@/game-engine/ui/graphics/DisplayObj";
import SingleLineFrame from "@/game-engine/ui/graphics/frame/SingleLineFrame";
import LoggerFactory from "@/logger/LoggerFactory";
import { Rectangle } from "@/models/Rectangle";
import * as PIXI from "pixi.js";
import { LINE_JOIN } from "pixi.js";
import Container from "typedi";

export default abstract class Canvas extends Drawer implements DisplayObj {
  private logger = LoggerFactory.getLogger("GameEngine.UI.Graphics.Canvas");
  protected mapRepository = Container.get(MapRepository);
  protected gameApp = Container.get(GameApp);

  container?: PIXI.Container;
  visibleWidth = 0;
  visibleHeight = 0;
  x = 0;
  y = 0;
  verticalScroll = false;
  verticalOffset = 0;
  scrollStep = 20;
  frame = new SingleLineFrame();

  public getName(): string {
    return "CanvasDrawer";
  }

  protected doDraw(): void {
    if (this.isFirstDraw()) {
      this.logger.info(`Initialize canvas`);
      const app = this.gameApp.getApp();
      const content = this.createContent();
      if (this.container) {
        app.stage.removeChild(this.container);
      }
      this.container = this.createCanvas(content);
      app.stage.addChild(this.container);
    }
  }

  protected createCanvas(content: PIXI.Container): PIXI.Container {
    const container = new PIXI.Container();
    container.name = this.getCanvasName(content);
    const contentArea = this.contentArea();
    container.addChild(
      this.frame.createFrame(0, 0, this.visibleWidth, this.visibleHeight)
    );
    content.y = contentArea.y + this.verticalOffset;
    content.x = contentArea.x;
    container.addChild(content);
    container.x = this.x;
    container.y = this.y;

    if (contentArea.height < content.height) {
      const up = this.upButton(content);
      up.x = contentArea.width - 10;
      up.y = contentArea.y - 12;
      container.addChild(up);

      const down = this.downButton(content);
      down.x = contentArea.width - 10;
      down.y = contentArea.y + contentArea.height - 30;
      container.addChild(down);
    }

    content.mask = this.mask();
    return container;
  }

  protected abstract createContent(): PIXI.Container;

  protected mask(): PIXI.Graphics {
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff, 0.2);
    const visibleArea = this.contentArea();
    mask.drawRect(
      this.x + visibleArea.x,
      this.y + visibleArea.y,
      visibleArea.width,
      visibleArea.height
    );
    mask.endFill();
    return mask;
  }

  protected getCanvasName(content: PIXI.Container): string {
    return `CANVAS_${content.name}`;
  }

  protected upButton(content: PIXI.Container): PIXI.Container {
    const btn = new PIXI.Text("↑", {
      fontFamily: "Courier",
      fill: "#ffffff",
      stroke: "#4a1850",
      strokeThickness: 4,
      lineJoin: LINE_JOIN.ROUND,
    });
    new DetectEvent(btn).onTap((e) => this.up(content));
    return btn;
  }
  protected downButton(content: PIXI.Container): PIXI.Container {
    const btn = new PIXI.Text("↓", {
      fontFamily: "Courier",
      fill: "#ffffff",
      stroke: "#4a1850",
      strokeThickness: 4,
      lineJoin: LINE_JOIN.ROUND,
    });
    new DetectEvent(btn).onTap((e) => this.down(content));
    return btn;
  }

  protected up(content: PIXI.Container): void {
    this.verticalOffset += this.scrollStep;
    const contentArea = this.contentArea();
    if (this.verticalOffset >= 0) {
      this.verticalOffset = 0;
    }
    content.y = contentArea.y + this.verticalOffset;
  }
  protected down(content: PIXI.Container): void {
    this.verticalOffset -= this.scrollStep;
    const contentArea = this.contentArea();
    if (this.verticalOffset + content.height <= contentArea.height) {
      this.verticalOffset = contentArea.height - content.height;
    }
    content.y = contentArea.y + this.verticalOffset;
  }

  protected contentArea(): Rectangle {
    return this.frame.innerArea(this.visibleWidth, this.visibleHeight);
  }

  setX(x: number): void {
    if (this.container) this.container.x = x;
  }
  setY(y: number): void {
    if (this.container) this.container.y = y;
  }
  disabled(): boolean {
    return false;
  }
  update(): void {
    return;
  }
  getWidth(): number {
    return this.container ? this.container.width : 0;
  }
  getHeight(): number {
    return this.container ? this.container.height : 0;
  }
  getContainer(): PIXI.Container {
    if (this.container) return this.container;
    throw Error(`Container is not defined`);
  }
}
