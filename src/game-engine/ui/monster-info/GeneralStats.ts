import ComputedEffectUtil from "@/game-engine/ability/computed-effect/ComputedEffectUtil";
import { LevelUpService } from "@/game-engine/monster/LevelUpService";
import Monster from "@/game-engine/model/monster/Monster";
import MonsterIndex from "@/game-engine/model/monster/MonsterIndex";
import FontService from "@/game-engine/ui/graphics/FontService";
import ScreenProxy from "@/game-engine/ScreenProxy";
import LoggerFactory from "@/logger/LoggerFactory";
import ArrayUtil from "@/utils/ArrayUtil";
import NumberUtil from "@/utils/NumberUtil";
import * as PIXI from "pixi.js";
import Container from "typedi";

export default class GeneralStats {
  logger = LoggerFactory.getLogger("GameEngine.UI.MonsterInfo.GeneralStats");

  protected screenProxy = Container.get(ScreenProxy);
  protected fontService = Container.get(FontService);
  protected levelUpService = Container.get(LevelUpService);

  protected monster;
  protected monsterIndex;

  protected options = {
    row: {
      height: 20,
    },
    stats: {
      cols: [{ leftOffset: 5 }, { leftOffset: 85 }],
    },
  };

  public constructor(monster: Monster, monsterIndex: MonsterIndex) {
    this.monster = monster;
    this.monsterIndex = monsterIndex;
  }

  public create(): PIXI.Container {
    this.logger.debug(`Show stats of ${this.monster.uuid}`);
    const container = new PIXI.Container();
    container.name = "GeneralStats";

    let _line = 0;
    const nextLine = () => {
      const next = this.lineY(_line);
      _line++;
      return next;
    };

    const f = (n: number): string => {
      return NumberUtil.formatInt(n);
    };

    const x1 = this.statsCol1();
    this.addText(container, this.monster.name, x1, nextLine());
    this.addText(container, `${this.monsterIndex.name}`, x1, nextLine());
    this.addText(container, `Lv. ${this.monster.level}`, x1, nextLine());
    this.addText(
      container,
      `Exp ${f(this.monster.experience)}`,
      x1,
      nextLine()
    );
    this.addText(
      container,
      `To Next lv. ${f(this.levelUpService.toNextLevel(this.monster))}`,
      x1,
      nextLine()
    );
    const statuses = this.getStatuses();
    this.addText(container, `Status ${statuses.join(", ")}`, x1, nextLine());
    const stats = this.monster.stats;
    this.addStat(
      container,
      `HP`,
      `${f(stats.hp)}/${f(stats.maxHP)}`,
      nextLine()
    );
    this.addStat(container, `ATK`, `${f(stats.atk)}`, nextLine());
    this.addStat(container, `DEF`, `${f(stats.def)}`, nextLine());
    this.addStat(container, `INT`, `${f(stats.int)}`, nextLine());
    this.addStat(container, `RES`, `${f(stats.res)}`, nextLine());
    this.addStat(container, `HIT`, `${f(stats.hit)}`, nextLine());
    this.addStat(container, `DEX`, `${f(stats.dex)}`, nextLine());
    this.addStat(container, `SPD`, `${f(stats.speed)}`, nextLine());

    container.x = 0;
    container.y = 0;
    return container;
  }

  protected getStatuses(): string[] {
    return ArrayUtil.removeDuplicates(
      ComputedEffectUtil.getStatusAlterations(this.monster.activeEffects).map(
        (a) => a.status
      ),
      (a, b) => a === b
    );
  }
  protected addStat(
    container: PIXI.Container,
    stat: string,
    value: string,
    y: number
  ): void {
    this.addText(container, stat, this.statsCol1(), y);
    this.addText(container, value, this.statsCol2(), y);
  }

  protected addText(
    container: PIXI.Container,
    text: string,
    x: number,
    y: number
  ): void {
    const entry = new PIXI.Text(text, this.fontService.monsterInfo());
    entry.x = x;
    entry.y = y;
    container.addChild(entry);
  }

  protected statsCol1(): number {
    return this.options.stats.cols[0].leftOffset;
  }
  protected statsCol2(): number {
    return this.options.stats.cols[1].leftOffset;
  }
  protected lineY(line: number): number {
    return line * this.options.row.height;
  }
}
