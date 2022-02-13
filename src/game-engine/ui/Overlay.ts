import GameApp from "@/game-engine/GameApp";
import DetectEvent from "@/game-engine/ui/DetectEvent";
import Drawer from "@/game-engine/ui/Drawer";
import FontService from "@/game-engine/ui/FontService";
import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import * as PIXI from "pixi.js";
import { InteractionEvent } from "pixi.js";
import Container from "typedi";

export default class Overlay extends Drawer {
  logger = LoggerFactory.getLogger("GameEngine.UI.Overlay");

  protected fontService = Container.get<FontService>(FontService);
  protected gameApp = Container.get<GameApp>(GameApp);

  protected parent: PIXI.Container;
  protected frame: PIXI.Container;
  protected content: PIXI.Container;
  protected _dragLastPoint: Point | null = null;

  public constructor(parent: PIXI.Container) {
    super();
    this.parent = parent;
    this.frame = new PIXI.Container();
    this.content = new PIXI.Container();
  }

  public getName(): string {
    return "Overlay";
  }

  protected doDraw(): void {
    if (this.isFirstDraw()) {
      this.init();
    }
  }

  protected init(): void {
    this.logger.info(`init`);
    this.frame = this.createFrame();
    this.initContent();
    this.frame.addChild(this.content);
    this.eventListener(this.content);
    this.parent.addChild(this.frame);
  }

  protected createFrame(): PIXI.Container {
    this.logger.info(`createFrame`);
    const frame = new PIXI.Container();
    frame.name = "frame";
    frame.x = this.x();
    frame.y = this.y();
    frame.width = this.width();
    frame.height = this.maxHeight();
    frame.mask = this.mask();

    const background = new PIXI.Graphics();
    background.lineStyle({ width: 4, color: 0x000000 });
    background.beginFill(0xffffff);
    background.drawRect(0, 0, this.width(), this.maxHeight());
    background.endFill();
    frame.addChild(background);
    return frame;
  }

  protected initContent(): void {
    this.logger.info(`create content`);
    this.content = new PIXI.Container();
    this.content.name = "this.contentContent";
    this.content.x = 2;
    this.content.y = 2;
    this.content.width = this.width();

    const background = new PIXI.Graphics();
    background.beginFill(0xff0000);
    background.drawRect(0, 0, 100, this.height());
    background.endFill();
    this.content.addChild(background);
  }

  protected mask(): PIXI.Graphics {
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff, 0.2);
    mask.drawRect(
      this.x() - 2,
      this.y() - 2,
      this.width() + 4,
      this.maxHeight() + 4
    );
    mask.endFill();
    return mask;
  }

  protected x(): number {
    return 300;
  }

  protected y(): number {
    return 5;
  }
  protected width(): number {
    return 500;
  }

  protected height(): number {
    return 800;
  }

  protected maxHeight(): number {
    return 500;
  }

  protected eventListener(
    obj: PIXI.DisplayObject,
    onTap: null | ((e: InteractionEvent) => void) = null
  ): void {
    const evt = new DetectEvent(obj);
    evt.onDragStart((e) => this.onDragStart(obj, e));
    evt.onDragEnd((e) => this.onDragStart(obj, e));
    evt.onDrag((e) => this.onDrag(obj, e));
    if (onTap) {
      evt.onTap(onTap);
    }
  }

  protected onDragStart(obj: PIXI.DisplayObject, e: InteractionEvent): void {
    this._dragLastPoint = new Point(e.data.global.x, e.data.global.y);
  }
  protected onDragEnd(obj: PIXI.DisplayObject, e: InteractionEvent): void {
    this._dragLastPoint = null;
  }
  protected onDrag(obj: PIXI.DisplayObject, e: InteractionEvent): void {
    if (this._dragLastPoint === null) {
      return;
    }
    const newPosition = new Point(e.data.global.x, e.data.global.y);
    const diffX = newPosition.x - this._dragLastPoint.x;
    const diffY = newPosition.y - this._dragLastPoint.y;
    this._dragLastPoint = newPosition;
    this.content.x += diffX;
    this.content.y += diffY;
  }
}
