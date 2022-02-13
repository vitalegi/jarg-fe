import { Rectangle } from "@/models/Rectangle";
import * as PIXI from "pixi.js";

export default class SingleLineFrame {
  protected options = {
    style: { width: 3, color: 0x000000 },
    background: 0xffffff,
    margin: 2,
    padding: 2,
  };
  public createFrame(
    x: number,
    y: number,
    width: number,
    height: number
  ): PIXI.Graphics {
    const background = new PIXI.Graphics();
    background
      .beginFill(this.options.background)
      .drawRect(x, y, width, height)
      .endFill();
    const w = this.options.style.width / 2;
    const padding = this.options.padding;
    const x1 = x + padding + w;
    const x2 = x + width - w - padding;
    const y1 = y + w + padding;
    const y2 = y + height - w - padding;
    background
      .lineStyle(this.options.style)
      .moveTo(x1, y1)
      .lineTo(x2, y1)
      .lineTo(x2, y2)
      .lineTo(x1, y2)
      .lineTo(x1, y1)
      .lineTo(x2, y1);
    return background;
  }

  protected getWidth(): number {
    return (
      this.options.style.width + this.options.margin + this.options.padding
    );
  }

  public innerArea(width: number, height: number): Rectangle {
    return new Rectangle(
      this.getWidth(),
      this.getWidth(),
      width - this.getWidth() * 2,
      height - this.getWidth() * 2
    );
  }
}
