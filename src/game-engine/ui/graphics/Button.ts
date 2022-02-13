import * as PIXI from "pixi.js";
import CONFIG from "@/assets/styles/button.json";
import NumberUtil from "@/utils/NumberUtil";
import { LINE_JOIN } from "pixi.js";
import DetectEvent from "@/game-engine/ui/DetectEvent";
import DisplayObj from "@/game-engine/ui/graphics/DisplayObj";

declare interface Border extends Partial<PIXI.ILineStyleOptions> {
  radius?: number;
  tile?: boolean;
}

declare interface Background {
  color?: string;
}

declare interface Margin {
  margin?: number;
}

declare interface Style {
  font?: Partial<PIXI.ITextStyle>;
  background?: Background;
  border?: Border;
  margin?: Margin;
}

declare interface Options {
  name: string;
  label(): string;
  disabled(): boolean;
  onTap?(): void;
  style: Style;
  onClickStyle: Style;
}

export default class Button implements DisplayObj {
  private static LABEL_NAME = "BTN_LABEL";
  private static SHAPE_NAME = "BTN_SHAPE";

  protected container;
  protected originalOptions: Partial<Options>;
  protected options: Partial<Options>;

  public constructor(options: Partial<Options>) {
    this.originalOptions = options;
    this.options = {};
    this.initOptions();
    this.container = new PIXI.Container();
    this.initGraphics(this.options.style);
    this.initListeners();
  }

  public update(): void {
    this.initOptions();
    this.initGraphics(this.options.style);
  }

  public getContainer(): PIXI.Container {
    return this.container;
  }
  public setX(x: number): void {
    this.container.x = x;
  }
  public setY(y: number): void {
    this.container.y = y;
  }
  public disabled(): boolean {
    return this.isDisabled();
  }
  public getWidth(): number {
    return this.getContainer().width;
  }
  public getHeight(): number {
    return this.getContainer().height;
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
    const label = this.options.label();
    this.container.removeChild(
      this.container.getChildByName(Button.LABEL_NAME)
    );
    const text = new PIXI.Text(label, style?.font);
    text.name = Button.LABEL_NAME;
    if (style?.border?.width) {
      text.x = style.border.width;
      text.y = style.border.width;
    }
    if (style?.margin?.margin) {
      text.x += style.margin.margin;
      text.y += style.margin.margin;
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
    if (style.background?.color) {
      border.beginFill(NumberUtil.parseHex(style.background.color));
    }
    if (radius === 0 || style.border.tile) {
      border
        .moveTo(x1, y1)
        .lineTo(x1, y2)
        .lineTo(x2, y2)
        .lineTo(x2, y1)
        .lineTo(x1, y1);
    } else {
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
    }
    if (style.background) {
      border.endFill();
    }
    this.container.addChildAt(border, 0);
  }

  protected initListeners(): void {
    const evt = new DetectEvent(this.container);
    evt.onTap((e) => {
      // button is tapped, trigger event
      if (this.options.onTap) {
        this.options.onTap();
      }
    });

    evt.onTapDown((e) => {
      this.initGraphics(this.options.onClickStyle);
    });
    evt.onTapUp((e) => {
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
    if (style.margin?.margin) {
      value += style.margin.margin;
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
    if (style.margin?.margin) {
      value += style.margin.margin;
    }
    return value;
  }

  protected initOptions(): void {
    this.options = {};
    this.options.name = this.originalOptions.name;
    this.options.label = this.originalOptions.label;
    this.options.onTap = this.originalOptions.onTap;
    this.options.disabled = this.originalOptions.disabled;

    this.options.style = this.createStyle([
      this.originalOptions.style,
      this.isDisabled() ? CONFIG.disabledStyle : undefined,
      CONFIG.defaultStyle,
    ]);
    this.options.onClickStyle = this.createStyle([
      this.originalOptions.onClickStyle,
      this.isDisabled() ? CONFIG.disabledStyle : undefined,
      CONFIG.onClickStyle,
      CONFIG.defaultStyle,
    ]);
  }

  protected createStyle(models: any[]): Style {
    models = JSON.parse(JSON.stringify(models.filter((m) => m !== undefined)));
    const style: Style = {
      font: {},
      background: {},
      border: {},
      margin: {},
    };
    models.forEach((m) => this.copyEmptyProps(m.font, style.font));
    models.forEach((m) => this.copyEmptyProps(m.background, style.background));
    models.forEach((m) => this.copyEmptyProps(m.border, style.border));
    if (style.border === "round") {
      style.border.join = LINE_JOIN.ROUND;
    }
    models.forEach((m) => this.copyEmptyProps(m.margin, style.margin));
    return style;
  }

  protected copyEmptyProps<E>(
    source: Partial<E> | undefined,
    target: Partial<E> | undefined
  ): void {
    if (source === undefined || target === undefined) {
      return;
    }
    for (const key in source) {
      if (!target[key] && source[key]) {
        target[key] = source[key];
      }
    }
  }

  protected copyObj<E>(source: Partial<E>, target: Partial<E>): void {
    for (const key in source) {
      if (source[key]) {
        target[key] = source[key];
      }
    }
  }

  protected isDisabled(): boolean {
    if (this.options.disabled) {
      return this.options.disabled();
    }
    return false;
  }
}
