import Container, { Service } from "typedi";
import * as PIXI from "pixi.js";
import { Monster } from "@/models/Character";
import { MapOption } from "@/models/Map";
import PlayerService from "../PlayerService";

@Service()
export default class HealthBarService {
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
    const x = this.x(options);
    const y = this.y(options);

    const background = new PIXI.Graphics();
    background.lineStyle({ width: barBorder, color: 0x000000 });
    background.beginFill(0xffffff);
    background.drawRect(x, y, barWidth, barHeight + barBorder + barBorder);
    background.endFill();
    background.name = "healthBar_background";

    const rectangle = this.createHealthBar(monster, null, options);

    container.addChild(background);
    container.addChild(rectangle);
  }

  public updateBar(
    container: PIXI.Container,
    monster: Monster,
    hp: number | null,
    options: MapOption
  ): void {
    const rectangle = container.getChildByName(
      "healthBar_bar"
    ) as PIXI.Graphics;

    container.removeChild(rectangle);
    container.addChild(this.createHealthBar(monster, hp, options));
  }

  protected createHealthBar(
    monster: Monster,
    hp: number | null,
    options: MapOption
  ): PIXI.Graphics {
    const barBorder = this.options.bar.border;
    const x = this.x(options);
    const y = this.y(options);
    const barHeight = this.options.bar.height;

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle({ width: barBorder, color: this.barColor(monster) });
    rectangle.beginFill(this.barColor(monster));

    rectangle.drawRect(
      x + barBorder,
      y + barBorder,
      this.healthWidth(monster, hp, options),
      barHeight
    );
    rectangle.endFill();
    rectangle.name = "healthBar_bar";

    return rectangle;
  }

  protected barWidth(options: MapOption): number {
    return 0.6 * options.tileWidth;
  }

  protected healthWidth(
    monster: Monster,
    hp: number | null,
    options: MapOption
  ): number {
    const remainingHP = hp ? hp : monster.stats.hp;
    const health = remainingHP / monster.stats.maxHP;
    const maxWidth = this.barWidth(options) - 2 * this.options.bar.border;
    let width = Math.round(health * maxWidth);
    if (width <= 0) {
      width = 0;
    }
    return width;
  }

  protected barColor(monster: Monster): number {
    const playerService = Container.get<PlayerService>(PlayerService);
    if (monster.ownerId === playerService.getPlayerId()) {
      return this.options.fillColor.player;
    }
    return this.options.fillColor.enemy;
  }

  protected healthX(options: MapOption): number {
    return this.x(options) + this.options.bar.border;
  }

  protected x(options: MapOption): number {
    return (options.tileWidth - this.barWidth(options)) / 2;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected y(options: MapOption): number {
    return 5;
  }
}
