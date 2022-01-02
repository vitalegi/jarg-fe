import { Monster, MonsterIndex } from "@/models/Character";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import FrameImpl from "./FrameImpl";
import Container from "typedi";
import WindowSizeProxy from "../WindowSizeProxy";
import NumberUtil from "@/utils/NumberUtil";
import Ability from "../monster-action/Ability";
import TimeUtil from "@/utils/TimeUtil";

export default class MonsterInfoDrawer extends Drawer {
  protected static NAME = "MonsterInfoDrawer";

  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected frame = new FrameImpl();
  protected monster;
  protected monsterIndex;
  protected _height = 0;

  protected options = {
    font: {
      fontFamily: "Courier",
      fontSize: 18,
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    },
    row: {
      height: 20,
    },
    stats: {
      cols: [{ leftOffset: 5 }, { leftOffset: 65 }],
    },
    abilities: {
      cols: [
        { leftOffset: 230 },
        { leftOffset: 480 },
        { leftOffset: 560 },
        { leftOffset: 640 },
      ],
    },
  };

  public constructor(
    parent: PIXI.Container,
    monster: Monster,
    monsterIndex: MonsterIndex
  ) {
    super();
    this.parent = parent;
    this.monster = monster;
    this.monsterIndex = monsterIndex;
  }

  public getName(): string {
    return "MonsterInfoDrawer";
  }

  protected doDraw(): void {
    if (this.container === null) {
      console.log(`Show stats of ${this.monster.uuid}`);
      this.container = new PIXI.Container();
      this.container.name = MonsterInfoDrawer.NAME;

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

      const x1 = this.statsCol1();
      this.addText(this.monster.name, x1, lineY());
      this.addText(`${this.monsterIndex.name}`, x1, lineY());
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
      this.addStat(`Speed`, `${f(stats.speed)}`, lineY());

      line = 0;
      this.addAbilityLabels(lineY());
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

    if (this.isResized()) {
      if (this.container) {
        this.container.x = this.x();
        this.container.y = this.y();
        this.container.width = this.width();
        this.container.height = this.height();
      }
    }
  }

  protected addText(text: string, x: number, y: number): void {
    const entry = new PIXI.Text(text, this.options.font);
    entry.x = x;
    entry.y = y;
    this.container?.addChild(entry);
  }

  protected addStat(stat: string, value: string, y: number): void {
    this.addText(stat, this.statsCol1(), y);
    this.addText(value, this.statsCol2(), y);
  }

  protected addAbilityLabels(y: number): void {
    this.addText("Ability", this.abilityCol1(), y);
    this.addText("Power", this.abilityCol2(), y);
    this.addText("Prec.", this.abilityCol3(), y);
    this.addText("PP", this.abilityCol4(), y);
  }
  protected addAbility(ability: Ability, y: number): void {
    this.addText(ability.label, this.abilityCol1(), y);
    this.addText(`${ability.power}`, this.abilityCol2(), y);
    this.addText(`${ability.precision}`, this.abilityCol3(), y);
    this.addText(
      `${ability.usages.current}/${ability.usages.max}`,
      this.abilityCol4(),
      y
    );
  }

  protected x(): number {
    return (this.windowSizeProxy.width() - this.width()) / 2;
  }

  protected y(): number {
    return (this.windowSizeProxy.height() - this.height()) / 2;
  }

  protected width(): number {
    return 700;
  }

  protected height(): number {
    return this._height;
  }

  protected statsCol1(): number {
    return this.frame.getWidth() + this.options.stats.cols[0].leftOffset;
  }
  protected statsCol2(): number {
    return this.frame.getWidth() + this.options.stats.cols[1].leftOffset;
  }
  protected abilityCol1(): number {
    return this.frame.getWidth() + this.options.abilities.cols[0].leftOffset;
  }
  protected abilityCol2(): number {
    return this.frame.getWidth() + this.options.abilities.cols[1].leftOffset;
  }
  protected abilityCol3(): number {
    return this.frame.getWidth() + this.options.abilities.cols[2].leftOffset;
  }
  protected abilityCol4(): number {
    return this.frame.getWidth() + this.options.abilities.cols[3].leftOffset;
  }
  protected lineY(line: number): number {
    return this.frame.getWidth() + 4 + line * this.options.row.height;
  }

  protected monitor<E>(name: string, fn: () => E): E {
    const startTime = TimeUtil.timestamp();
    const result = fn();

    const duration = Math.round(100 * (TimeUtil.timestamp() - startTime)) / 100;
    console.log(`MONITORING ${name}, time_taken=${duration}ms`);
    return result;
  }
}
