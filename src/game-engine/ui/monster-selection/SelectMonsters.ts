import Monster from "@/game-engine/model/monster/Monster";
import Canvas from "@/game-engine/ui/graphics/Canvas";
import LoggerFactory from "@/logger/LoggerFactory";
import * as PIXI from "pixi.js";
import { LINE_JOIN } from "pixi.js";

export default class SelectMonsters extends Canvas {
  private logger2 = LoggerFactory.getLogger(
    "GameEngine.UI.MonsterSelection.SelectMonsters"
  );

  monsters;
  max;
  min;
  selected: Monster[] = [];

  onSubmit: null | ((selectedMonsters: Monster[]) => void) = null;
  onCancel: null | (() => void) = null;

  public constructor(monsters: Monster[], max: number, min: number) {
    super();
    this.monsters = monsters;
    this.max = max;
    this.min = min;
    this.x = 10;
    this.y = 10;
    this.visibleWidth = 250;
    this.visibleHeight = 280;
  }
  protected createContent(): PIXI.Container {
    const content = new PIXI.Container();
    content.name = "SELECT_MONSTERS";
    for (let i = 0; i < 18; i++) {
      const message = new PIXI.Text(`Entry ${i}`, {
        fontFamily: "Courier",
        fill: "#ffffff",
        stroke: "#4a1850",
        strokeThickness: 4,
        lineJoin: LINE_JOIN.ROUND,
      });
      message.x = 0;
      message.y = i * 20;
      content.addChild(message);
    }
    return content;
  }
}
