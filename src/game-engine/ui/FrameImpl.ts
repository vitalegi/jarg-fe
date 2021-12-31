import * as PIXI from "pixi.js";

export default class FrameImpl {
  protected static NAME = "FrameImpl";

  protected options = {
    style: { width: 4, color: 0x000000 },
    background: 0xffffff,
  };
  public createFrame(
    x: number,
    y: number,
    width: number,
    height: number
  ): PIXI.Graphics {
    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle(this.options.style);
    rectangle.beginFill(this.options.background);
    rectangle.drawRect(
      x + this.options.style.width,
      y + this.options.style.width,
      width + 2 * this.options.style.width,
      height + 2 * this.options.style.width
    );
    rectangle.endFill();
    return rectangle;
  }

  public getWidth(): number {
    return this.options.style.width;
  }

  public getName(): string {
    return FrameImpl.NAME;
  }
}
