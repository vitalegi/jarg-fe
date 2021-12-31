import { Monster } from "@/models/Character";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import Point from "@/models/Point";
import FrameImpl from "./FrameImpl";
import TimeUtil from "@/utils/TimeUtil";
import Container from "typedi";
import WindowSizeProxy from "../WindowSizeProxy";
import NumberUtil from "@/utils/NumberUtil";
import Ability from "../monster-action/Ability";

export default class MonsterInfoDrawer extends Drawer {
  protected static NAME = "MonsterInfoDrawer";

  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected frame = new FrameImpl();
  protected monster;
  protected _height = 0;

  protected options = {
    font: {
      fontFamily: "Courier",
      fontSize: 22,
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    },
    row: {
      height: 26,
    },
    cols: [{ leftOffset: 5 }, { leftOffset: 65 }, { leftOffset: 220 }],
  };

  public constructor(parent: PIXI.Container, monster: Monster) {
    super();
    this.parent = parent;
    this.monster = monster;
  }

  protected getName(): string {
    return "MonsterInfoDrawer";
  }

  public doDraw(): void {
    if (this.container === null) {
      console.log(`Show stats of ${this.monster.uuid}`);
      this.container = new PIXI.Container();
      this.container.name = MonsterInfoDrawer.NAME;

      const x1 = this.xCol1();
      let line = 0;
      const lineY = () => {
        const v = this.lineY(line);
        this._height = Math.max(
          this._height,
          this.lineY(line) + this.options.row.height
        );
        line++;
        return v;
      };
      const f = (n: number): string => {
        return NumberUtil.formatInt(n);
      };

      this.addText(this.monster.name, x1, lineY());
      this.addText(`Lv. ${this.monster.level}`, x1, lineY());
      this.addText(`Exp ${f(this.monster.experience)}`, x1, lineY());

      const stats = this.monster.stats;
      this.addStat(`HP`, `${f(stats.hp)}/${f(stats.maxHP)}`, lineY());
      this.addStat(`ATK`, `${f(stats.atk)}`, lineY());
      this.addStat(`DEF`, `${f(stats.def)}`, lineY());
      this.addStat(`INT`, `${f(stats.int)}`, lineY());
      this.addStat(`RES`, `${f(stats.res)}`, lineY());
      this.addStat(`HIT`, `${f(stats.hit)}`, lineY());
      this.addStat(`DEX`, `${f(stats.dex)}`, lineY());

      line = 0;
      this.addText(`Abilities`, this.abilityCol1(), lineY());
      this.monster.abilities.forEach((ability: Ability) =>
        this.addAbility(ability, lineY())
      );

      console.log(
        `x=${this.x()}, y=${this.y()}, width=${this.width()}, height=${this.height()}`
      );

      this.container.x = this.x();
      this.container.y = this.y();
      this.container.width = this.width();
      this.container.height = this.height();

      this.container.addChildAt(
        this.frame.createFrame(0, 0, this.width(), this.height()),
        0
      );

      this.container.interactive = true;
      this.container.on("pointertap", () => {
        if (this.container) {
          this.parent.removeChild(this.container);
        }
        this.complete();
      });

      this.parent.addChild(this.container);
    }
    if (this.screenResized()) {
      this.container.x = this.x();
      this.container.y = this.y();
      this.container.width = this.width();
      this.container.height = this.height();
    }
  }

  protected addText(text: string, x: number, y: number): void {
    const entry = new PIXI.Text(text, this.options.font);
    entry.x = x;
    entry.y = y;
    this.container?.addChild(entry);
  }

  protected addStat(stat: string, value: string, y: number): void {
    this.addText(stat, this.xCol1(), y);
    this.addText(value, this.xCol2(), y);
  }

  protected addAbility(ability: Ability, y: number): void {
    this.addText(ability.label, this.abilityCol1(), y);
  }

  protected x(): number {
    return (this.windowSizeProxy.width() - this.width()) / 2;
  }

  protected y(): number {
    return (this.windowSizeProxy.height() - this.height()) / 2;
  }

  protected width(): number {
    return Math.min(700, Math.round(this.windowSizeProxy.width() * 0.9));
  }

  protected height(): number {
    return this._height;
  }

  protected xCol1(): number {
    return this.frame.getWidth() + this.options.cols[0].leftOffset;
  }
  protected xCol2(): number {
    return this.frame.getWidth() + this.options.cols[1].leftOffset;
  }
  protected abilityCol1(): number {
    return this.frame.getWidth() + this.options.cols[2].leftOffset;
  }
  protected lineY(line: number): number {
    return this.frame.getWidth() + 4 + line * this.options.row.height;
  }
  protected screenResized(): boolean {
    if (this.container === null) {
      return false;
    }
    const changed = (n1: number, n2: number) => Math.abs(n1 - n2) < 0.0001;
    return (
      changed(this.container.x, this.x()) ||
      changed(this.container.y, this.y()) ||
      changed(this.container.width, this.width()) ||
      changed(this.container.height, this.height())
    );
  }
}
