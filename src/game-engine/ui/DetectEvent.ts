import LoggerFactory from "@/logger/LoggerFactory";
import Point from "@/models/Point";
import * as PIXI from "pixi.js";
import { InteractionEvent } from "pixi.js";

export default class DetectEvent {
  logger = LoggerFactory.getLogger("GameEngine.UI.DetectEvent");
  protected element;
  protected startingPoint: Point | null = null;
  protected lastPoint: Point | null = null;
  protected drag = false;

  protected _onTap: ((e: InteractionEvent) => void) | null = null;
  protected _onDragStart: ((e: InteractionEvent) => void) | null = null;
  protected _onDrag: ((e: InteractionEvent) => void) | null = null;
  protected _onDragEnd: ((e: InteractionEvent) => void) | null = null;

  public constructor(
    element: PIXI.DisplayObject,
    onTap: ((e: InteractionEvent) => void) | null = null,
    onDragStart: ((e: InteractionEvent) => void) | null = null,
    onDrag: ((e: InteractionEvent) => void) | null = null,
    onDragEnd: ((e: InteractionEvent) => void) | null = null
  ) {
    this.element = element;
    this.init();
    this._onTap = onTap;
    this._onDragStart = onDragStart;
    this._onDrag = onDrag;
    this._onDragEnd = onDragEnd;
  }

  public onTap(action: (e: InteractionEvent) => void): void {
    this._onTap = action;
  }
  public onDragStart(action: (e: InteractionEvent) => void): void {
    this._onDragStart = action;
  }
  public onDrag(action: (e: InteractionEvent) => void): void {
    this._onDrag = action;
  }

  public onDragEnd(action: (e: InteractionEvent) => void): void {
    this._onDragEnd = action;
  }

  protected init(): void {
    this.element.interactive = true;

    this.element.on("pointerdown", (e: InteractionEvent) =>
      this.pointerdown(e)
    );
    this.element.on("pointermove", (e: InteractionEvent) =>
      this.pointermove(e)
    );
    this.element.on("pointerup", (e: InteractionEvent) => this.pointerup(e));
    this.element.on("pointerupoutside", (e: InteractionEvent) =>
      this.pointerup(e)
    );
  }

  protected pointerdown(e: InteractionEvent): void {
    this.startingPoint = new Point(e.data.global.x, e.data.global.y);
    this.lastPoint = new Point(e.data.global.x, e.data.global.y);
    this.drag = false;
  }

  protected pointerup(e: InteractionEvent): void {
    if (!this.startingPoint) {
      this.logger.debug(`Pointer up but starting point not selected`);
      return;
    }
    if (this.drag && this._onDragEnd) {
      this.logger.debug(`dragEnd ${this.element.name}`);
      this._onDragEnd(e);
    }
    if (!this.drag && this._onTap) {
      this.logger.debug(`tap ${this.element.name}`);
      this._onTap(e);
    }

    this.startingPoint = null;
    this.lastPoint = null;
    this.drag = false;
  }

  protected pointermove(e: InteractionEvent): void {
    if (!this.startingPoint || !this.lastPoint) {
      return;
    }
    const x = e.data.global.x;
    const y = e.data.global.y;
    const curr = new Point(x, y);
    if (this.distance(curr, this.startingPoint) > 1 && !this.drag) {
      this.drag = true;
      if (this._onDragStart) {
        this.logger.debug("EVENT dragStart");
        this._onDragStart(e);
      }
    }
    if (this.distance(curr, this.lastPoint) > 1) {
      if (this._onDrag) {
        this._onDrag(e);
      }
      this.lastPoint = curr.clone();
    }
  }

  protected distance(p1: Point, p2: Point): number {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
  }
}
