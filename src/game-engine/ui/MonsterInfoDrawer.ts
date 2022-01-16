import Monster from "@/game-engine/monster/Monster";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import FrameImpl from "./FrameImpl";
import Container from "typedi";
import WindowSizeProxy from "../WindowSizeProxy";
import NumberUtil from "@/utils/NumberUtil";
import TimeUtil from "@/utils/TimeUtil";
import MonsterIndex from "../monster/MonsterIndex";
import FontService from "./FontService";
import { LevelUpService } from "../monster/LevelUpService";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityLearned from "../monster-action/ability/AbilityLearned";
import AbilityRepository from "../repositories/AbilityRepository";
import ArrayUtil from "@/utils/ArrayUtil";
import TapAnythingUserActionHandler from "../user-action-handler/TapAnythingUserActionHandler";
import UserActionService from "../user-action-handler/UserActionService";

export default class MonsterInfoDrawer extends Drawer {
  logger = LoggerFactory.getLogger("GameEngine.UI.MonsterInfoDrawer");
  protected static NAME = "MonsterInfoDrawer";

  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected fontService = Container.get<FontService>(FontService);
  protected levelUpService = Container.get<LevelUpService>(LevelUpService);
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);
  protected userActionService =
    Container.get<UserActionService>(UserActionService);

  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected frame = new FrameImpl();
  protected monster;
  protected monsterIndex;
  protected _height = 0;

  protected options = {
    row: {
      height: 20,
    },
    stats: {
      cols: [{ leftOffset: 5 }, { leftOffset: 80 }],
    },
    abilities: {
      cols: [
        { leftOffset: 250 },
        { leftOffset: 460 },
        { leftOffset: 540 },
        { leftOffset: 610 },
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
      this.logger.info(`Show stats of ${this.monster.uuid}`);
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
      this.addText(
        `To Next lv. ${f(this.levelUpService.toNextLevel(this.monster))}`,
        x1,
        lineY()
      );
      const statuses = ArrayUtil.removeDuplicates(
        this.monster.statusAlterations.map((s) => s.status),
        (a, b) => a === b
      );
      this.addText(`Status ${statuses.join(", ")}`, x1, lineY());
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
      this.monster.abilities.forEach((learned: AbilityLearned) =>
        this.addAbility(learned, lineY())
      );

      this.logger.debug(
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
      this.userActionService.initContainer(this.container);

      const actionHandler = new TapAnythingUserActionHandler();
      this.userActionService.addActionHandler(actionHandler),
        actionHandler.execute().then(() => {
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
    const entry = new PIXI.Text(text, this.fontService.monsterInfo());
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
  protected addAbility(learned: AbilityLearned, y: number): void {
    const ability = this.abilityRepository.getAbility(learned.abilityId);
    this.addText(ability.label, this.abilityCol1(), y);
    this.addText(`${ability.power}`, this.abilityCol2(), y);
    this.addText(`${ability.precision}`, this.abilityCol3(), y);
    this.addText(
      `${learned.currentUsages}/${learned.maxUsages}`,
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
    // TODO use TimeUtil centralized method
    const duration = Math.round(100 * (TimeUtil.timestamp() - startTime)) / 100;
    this.logger.info(`MONITORING ${name}, time_taken=${duration}ms`);
    return result;
  }
}
