import Container, { Service } from "typedi";
import * as PIXI from "pixi.js";
import { Monster } from "@/models/Character";
import { MapOption } from "@/models/Map";
import {
  PixiContainerRepository,
  ContainersConstants,
} from "../repositories/PixiRepository";
import PlayerService from "../PlayerService";

@Service()
export default class HealthBarService {
  protected pixiContainerRepository = Container.get<PixiContainerRepository>(
    PixiContainerRepository
  );

  options = {
    bar: {
      border: 1,
      height: 2,
    },
    fillColor: {
      player: 0x00cc00,
      enemy: 0xcc0000,
    },
  };

  public createBar(
    container: PIXI.Container,
    monster: Monster,
    options: MapOption
  ): void {
    const barWidth = this.barWidth(options);
    const barBorder = this.options.bar.border;
    const barHeight = this.options.bar.height;
    const x = (options.tileWidth - barWidth) / 2;
    const y = 5;

    const background = new PIXI.Graphics();
    background.lineStyle({ width: barBorder, color: 0x000000 });
    background.beginFill(0xffffff);
    background.drawRect(x, y, barWidth, barHeight + barBorder + barBorder);
    background.endFill();
    background.name = "healthBar_background";

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle({ width: barBorder, color: this.barColor(monster) });
    rectangle.beginFill(this.barColor(monster));
    rectangle.drawRect(
      x + barBorder,
      y + barBorder,
      this.healthWidth(monster, options),
      barHeight
    );
    rectangle.endFill();
    rectangle.name = "healthBar_bar";

    container.addChild(background);
    container.addChild(rectangle);
  }

  public updateBar(monster: Monster, options: MapOption): void {
    const container = this.pixiContainerRepository.find(
      monster.uuid,
      ContainersConstants.MONSTER
    );
    if (!container) {
      return;
    }
    const rectangle = container.getChildByName(
      "healthBar_bar"
    ) as PIXI.Graphics;
    rectangle.width = this.healthWidth(monster, options);
  }

  protected barWidth(options: MapOption): number {
    return 0.6 * options.tileWidth;
  }

  protected healthWidth(monster: Monster, options: MapOption): number {
    let health = monster.stats.hp / monster.stats.maxHP;
    if (health < 0) {
      health = 0;
    }
    return health * (this.barWidth(options) - 2 * this.options.bar.border);
  }

  protected barColor(monster: Monster): number {
    const playerService = Container.get<PlayerService>(PlayerService);
    if (monster.ownerId === playerService.getPlayerId()) {
      return this.options.fillColor.player;
    }
    return this.options.fillColor.enemy;
  }
}
