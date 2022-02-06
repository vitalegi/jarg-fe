import * as PIXI from "pixi.js";
import { LINE_JOIN } from "pixi.js";
import DetectEvent from "./DetectEvent";

declare interface Style {
  font?: Partial<PIXI.ITextStyle>;
  background?: number;
  border?: Partial<{ radius: number } & PIXI.ILineStyleOptions>;
  margin?: number;
}

declare interface Options {
  name: string;
  label: string;
  style: Style;
  onClickStyle: Style;
}

export default class Button {
  private static LABEL_NAME = "BTN_LABEL";
  private static SHAPE_NAME = "BTN_SHAPE";

  protected container;
  protected options: Partial<Options>;

  public constructor(options: Partial<Options>) {
    this.options = options;
    this.initOptions();
    this.container = new PIXI.Container();
    this.initGraphics(options.style);
    this.initListeners();
  }

  public getContainer(): PIXI.Container {
    return this.container;
  }

  protected initGraphics(style?: Style): void {
    if (this.options.name) {
      this.container.name = this.options.name;
    }
    this.initLabel(style);
    this.initShape(style);
  }

  protected initLabel(style?: Style): void {
    if (!this.options.label) {
      return;
    }
    this.container.removeChild(
      this.container.getChildByName(Button.LABEL_NAME)
    );
    const text = new PIXI.Text(this.options.label, style?.font);
    text.name = Button.LABEL_NAME;
    if (style?.border?.width) {
      text.x = style.border.width;
      text.y = style.border.width;
    }
    if (style?.margin) {
      text.x += style.margin;
      text.y += style.margin;
    }
    this.container.addChild(text);
  }

  protected initShape(style?: Style): void {
    if (!style?.border) {
      return;
    }
    const border = new PIXI.Graphics();

    this.container.removeChild(
      this.container.getChildByName(Button.SHAPE_NAME)
    );
    border.name = Button.SHAPE_NAME;

    border.lineStyle(style.border);
    const x1 = 0;
    const x2 = this.width(style);
    const y1 = 0;
    const y2 = this.height(style);
    let radius = 0;
    if (style.border.radius) {
      radius = style.border.radius;
    }
    if (style.background) {
      border.beginFill(style.background);
    }
    border
      .moveTo(x1, y1 + radius)
      .lineTo(x1, y2 - radius)
      .arc(x1 + radius, y2 - radius, radius, Math.PI, Math.PI / 2, true)
      .lineTo(x2 - radius, y2)
      .arc(x2 - radius, y2 - radius, radius, Math.PI / 2, 0, true)
      .lineTo(x2, y1 + radius)
      .arc(x2 - radius, y1 + radius, radius, 0, -Math.PI / 2, true)
      .lineTo(x1 + radius, y1)
      .arc(x1 + radius, y1 + radius, radius, -Math.PI / 2, Math.PI, true);
    if (style.background) {
      border.endFill();
    }
    this.container.addChildAt(border, 0);
  }

  protected initListeners(): void {
    const evt = new DetectEvent(this.container);
    evt.onTap((e) => {
      console.log("click");
    });
    evt.onTapDown((e) => {
      console.log("style on click");
      this.initGraphics(this.options.onClickStyle);
    });
    evt.onTapUp((e) => {
      console.log("normal style");
      this.initGraphics(this.options.style);
    });
  }

  protected width(style: Style): number {
    let value = 0;
    const text = this.container.getChildByName(Button.LABEL_NAME);
    if (text) {
      value = text.x + (text as PIXI.Text).width;
    }
    if (style.border?.width) {
      value += style.border.width;
    }
    if (style.margin) {
      value += style.margin;
    }
    return value;
  }

  protected height(style: Style): number {
    let value = 0;
    const text = this.container.getChildByName(Button.LABEL_NAME);
    if (text) {
      value = text.y + (text as PIXI.Text).height;
    }
    if (style.border?.width) {
      value += style.border.width;
    }
    if (style.margin) {
      value += style.margin;
    }
    return value;
  }

  protected initOptions(): void {
    if (!this.options.style) {
      this.options.style = {};
    }
    this.fillStyle(
      this.options.style,
      this.defaultFont(),
      this.defaultBackground(),
      this.defaultBorder(),
      this.defaultMargin()
    );
    if (!this.options.onClickStyle) {
      this.options.onClickStyle = {};
    }
    this.fillStyle(
      this.options.onClickStyle,
      this.defaultOnClickFont(),
      this.defaultOnClickBackground(),
      this.defaultOnClickBorder(),
      this.defaultOnClickMargin()
    );
  }

  protected fillStyle(
    style: Style,
    font: Partial<PIXI.ITextStyle>,
    background: number,
    border: Partial<{ radius: number } & PIXI.ILineStyleOptions>,
    margin: number
  ): void {
    if (!style.font) {
      style.font = font;
    }
    if (!style.background) {
      style.background = background;
    }
    if (!style.border) {
      style.border = border;
    }
    if (!style.margin) {
      style.margin = margin;
    }
  }

  protected defaultFont(): Partial<PIXI.ITextStyle> {
    return {
      fontSize: 20,
      stroke: 0x2c2c2c,
    };
  }

  protected defaultBorder(): Partial<
    { radius: number } & PIXI.ILineStyleOptions
  > {
    return {
      radius: 8,
      width: 2,
      color: 0xa0a0a0,
      join: LINE_JOIN.ROUND,
    };
  }
  protected defaultBackground(): number {
    return 0xf6f6f6;
  }
  protected defaultMargin(): number {
    return 5;
  }

  protected defaultOnClickFont(): Partial<PIXI.ITextStyle> {
    return {
      fontSize: 20,
      stroke: 0x4b4b4b,
    };
  }

  protected defaultOnClickBorder(): Partial<
    { radius: number } & PIXI.ILineStyleOptions
  > {
    return {
      radius: 8,
      width: 2,
      color: 0xa0a0a0,
      join: LINE_JOIN.ROUND,
    };
  }
  protected defaultOnClickBackground(): number {
    return 0xd3d3d3;
  }
  protected defaultOnClickMargin(): number {
    return 5;
  }
}
