import DisplayObj from "@/game-engine/ui/graphics/DisplayObj";
import LoggerFactory from "@/logger/LoggerFactory";
import * as PIXI from "pixi.js";

// TODO add padding, margin
export default class List implements DisplayObj {
  protected logger = LoggerFactory.getLogger("GameEngine.UI.Graphics.List");
  protected container?: PIXI.Container;
  protected elements: DisplayObj[] = [];
  protected x = 0;
  protected y = 0;
  draw(): void {
    this.logger.debug(`Draw list with ${this.elements.length} elements`);
    this.container = new PIXI.Container();
    this.container.name = this.getContentName();
    let y = 0;
    for (const element of this.elements) {
      element.draw();
      element.setY(y);
      this.container.addChild(element.getContainer());
      y += element.getHeight();
    }
  }
  addElement(element: DisplayObj): void {
    this.elements.push(element);
  }
  update(): void {
    this.elements.forEach((e) => e.update());
  }
  setX(x: number): void {
    this.x = x;
  }
  setY(y: number): void {
    this.y = y;
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
    return "LIST";
  }
}
