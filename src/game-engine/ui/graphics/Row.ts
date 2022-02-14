import DisplayObj from "@/game-engine/ui/graphics/DisplayObj";
import LoggerFactory from "@/logger/LoggerFactory";
import * as PIXI from "pixi.js";

export default class Row implements DisplayObj {
  protected logger = LoggerFactory.getLogger("GameEngine.UI.Graphics.Row");
  protected container?: PIXI.Container;
  protected elements: DisplayObj[] = [];
  draw(): void {
    this.logger.debug(`Draw row with ${this.elements.length} elements`);
    this.container = new PIXI.Container();
    this.container.name = this.getContentName();
    let x = 0;
    for (const element of this.elements) {
      element.draw();
      element.setX(x);
      this.container.addChild(element.getContainer());
      x += element.getWidth();
    }
  }
  addElement(element: DisplayObj): void {
    this.elements.push(element);
  }
  update(): void {
    this.elements.forEach((e) => e.update());
  }
  setX(x: number): void {
    this.getContainer().x = x;
  }
  setY(y: number): void {
    this.getContainer().y = y;
  }
  disabled(): boolean {
    return false;
  }
  getWidth(): number {
    return this.getContainer().width;
  }
  getHeight(): number {
    return this.getContainer().height;
  }
  getContainer(): PIXI.Container {
    if (this.container) return this.container;
    throw Error(`Container is not defined`);
  }

  protected getContentName(): string {
    return "ROW";
  }
}
