import Canvas from "@/game-engine/ui/graphics/Canvas";
import DisplayObj from "@/game-engine/ui/graphics/DisplayObj";
import * as PIXI from "pixi.js";

export default class List extends Canvas {
  protected elements: DisplayObj[] = [];

  public addElement(element: DisplayObj): void {
    this.elements.push(element);
  }

  protected createContent(): PIXI.Container {
    const content = new PIXI.Container();
    content.name = this.getContentName();
    let y = 0;
    for (const element of this.elements) {
      element.setY(y);
      content.addChild(element.getContainer());
      y += element.getHeight();
    }
    return content;
  }

  update(): void {
    this.elements.forEach((e) => e.update());
    super.update();
  }

  protected getContentName(): string {
    return "LIST";
  }
}
