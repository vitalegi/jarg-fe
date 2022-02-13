import Container, { Service } from "typedi";
import * as PIXI from "pixi.js";
import Monster from "@/game-engine/monster/Monster";
import GameConfig from "@/game-engine/GameConfig";
import PlayerService from "@/game-engine/PlayerService";

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

  public createBar(container: PIXI.Container, monster: Monster): void {
    const barWidth = this.barWidth();
    const barBorder = this.options.bar.border;
    const barHeight = this.options.bar.height;
    const x = this.x();
    const y = this.y();

    const background = new PIXI.Graphics();
    background.lineStyle({ width: barBorder, color: 0x000000 });
    background.beginFill(0xffffff);
    background.drawRect(x, y, barWidth, barHeight + barBorder + barBorder);
    background.endFill();
    background.name = "healthBar_background";

    const rectangle = this.createHealthBar(monster, monster.stats.hp);

    container.addChild(background);
    container.addChild(rectangle);
  }

  public updateBar(
    container: PIXI.Container,
    monster: Monster,
    hp: number
  ): void {
    const rectangle = container.getChildByName(
      "healthBar_bar"
    ) as PIXI.Graphics;

    container.removeChild(rectangle);
    container.addChild(this.createHealthBar(monster, hp));
  }

  protected createHealthBar(monster: Monster, hp: number): PIXI.Graphics {
    const barBorder = this.options.bar.border;
    const x = this.x();
    const y = this.y();
    const barHeight = this.options.bar.height;

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle({ width: barBorder, color: this.barColor(monster) });
    rectangle.beginFill(this.barColor(monster));

    rectangle.drawRect(
      x + barBorder,
      y + barBorder,
      this.healthWidth(monster, hp),
      barHeight
    );
    rectangle.endFill();
    rectangle.name = "healthBar_bar";

    return rectangle;
  }

  protected barWidth(): number {
    return 0.6 * GameConfig.SHARED.tile.height;
  }

  protected healthWidth(monster: Monster, hp: number): number {
    const health = hp / monster.stats.maxHP;
    const maxWidth = this.barWidth() - 2 * this.options.bar.border;
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

  protected healthX(): number {
    return this.x() + this.options.bar.border;
  }

  protected x(): number {
    return (GameConfig.SHARED.tile.width - this.barWidth()) / 2;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected y(): number {
    return GameConfig.SHARED.tile.height - 12;
  }
}
