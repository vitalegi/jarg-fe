import Monster from "@/game-engine/monster/Monster";
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import WindowSizeProxy from "@/game-engine/WindowSizeProxy";
import LoggerFactory from "@/logger/LoggerFactory";
import * as PIXI from "pixi.js";
import Container from "typedi";
import FontService from "../FontService";
import { gameLabel } from "@/services/LocalizationService";
import AbilityLearned from "@/game-engine/monster-action/ability/AbilityLearned";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";

export default class Abilities {
  logger = LoggerFactory.getLogger("GameEngine.UI.MonsterInfo.GeneralStats");

  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected fontService = Container.get<FontService>(FontService);
  protected abilityRepository =
    Container.get<AbilityRepository>(AbilityRepository);
  protected monster;
  protected monsterIndex;

  protected options = {
    row: {
      height: 20,
    },
    abilities: {
      cols: [
        { leftOffset: 0 },
        { leftOffset: 210 },
        { leftOffset: 290 },
        { leftOffset: 365 },
      ],
    },
  };

  public constructor(monster: Monster, monsterIndex: MonsterIndex) {
    this.monster = monster;
    this.monsterIndex = monsterIndex;
  }

  public create(): PIXI.Container {
    this.logger.debug(`Show stats of ${this.monster.uuid}`);
    const container = new PIXI.Container();
    container.name = "Abilities";

    let _line = 0;
    const nextLine = () => {
      const next = this.lineY(_line);
      _line++;
      return next;
    };

    this.addAbilityLabels(container, nextLine());
    this.monster.abilities.forEach((learned: AbilityLearned) =>
      this.addAbility(container, learned, nextLine())
    );

    container.x = 0;
    container.y = 0;
    return container;
  }

  protected addAbilityLabels(container: PIXI.Container, y: number): void {
    this.addText(container, gameLabel("ability"), this.abilityCol1(), y);
    this.addText(container, gameLabel("power-short"), this.abilityCol2(), y);
    this.addText(
      container,
      gameLabel("precision-short"),
      this.abilityCol3(),
      y
    );
    this.addText(container, gameLabel("usages-short"), this.abilityCol4(), y);
  }
  protected addAbility(
    container: PIXI.Container,
    learned: AbilityLearned,
    y: number
  ): void {
    const ability = this.abilityRepository.getAbility(learned.abilityId);
    this.addText(container, ability.label, this.abilityCol1(), y);
    this.addText(container, `${ability.power}`, this.abilityCol2(), y);
    this.addText(container, `${ability.precision}`, this.abilityCol3(), y);
    this.addText(
      container,
      `${learned.currentUsages}/${learned.maxUsages}`,
      this.abilityCol4(),
      y
    );
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

  protected abilityCol1(): number {
    return this.options.abilities.cols[0].leftOffset;
  }
  protected abilityCol2(): number {
    return this.options.abilities.cols[1].leftOffset;
  }
  protected abilityCol3(): number {
    return this.options.abilities.cols[2].leftOffset;
  }
  protected abilityCol4(): number {
    return this.options.abilities.cols[3].leftOffset;
  }
  protected lineY(line: number): number {
    return line * this.options.row.height;
  }
}
