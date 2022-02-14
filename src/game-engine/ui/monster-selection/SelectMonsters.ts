import GameApp from "@/game-engine/GameApp";
import MapRepository from "@/game-engine/map/MapRepository";
import Monster from "@/game-engine/model/monster/Monster";
import Drawer from "@/game-engine/ui/Drawer";
import Button from "@/game-engine/ui/graphics/Button";
import Canvas from "@/game-engine/ui/graphics/Canvas";
import DisplayObj from "@/game-engine/ui/graphics/DisplayObj";
import List from "@/game-engine/ui/graphics/List";
import Row from "@/game-engine/ui/graphics/Row";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import * as PIXI from "pixi.js";
import Container from "typedi";

export default class SelectMonsters extends Drawer {
  private logger = LoggerFactory.getLogger(
    "GameEngine.UI.MonsterSelection.SelectMonsters"
  );
  protected mapRepository = Container.get(MapRepository);
  protected gameApp = Container.get(GameApp);

  monsters;
  max;
  min;
  x = 10;
  y = 10;
  visibleWidth = 250;
  visibleHeight = 280;
  selected: Monster[] = [];
  canvas?: Canvas;

  public getName(): string {
    return "SelectMonsters";
  }

  public constructor(monsters: Monster[], max: number, min: number) {
    super();
    this.monsters = monsters;
    this.max = max;
    this.min = min;
  }

  protected doDraw(): void {
    if (this.isFirstDraw()) {
      this.canvas = new Canvas();
      this.canvas.x = this.x;
      this.canvas.y = this.y;
      this.canvas.visibleWidth = this.visibleWidth;
      this.canvas.visibleHeight = this.visibleHeight;

      this.canvas.content = this.createList(this.monsters);

      this.logger.debug(`Initialize canvas`);
      const app = this.gameApp.getApp();
      this.canvas.draw();
      app.stage.addChild(this.canvas.getContainer());
    }
  }

  protected createList(monsters: Monster[]): List {
    const list = new List();

    const confirmBtn = this.confirmBtn();
    const line1 = new Row();
    line1.addElement(confirmBtn);
    line1.addElement(this.cancelBtn());
    list.addElement(line1);

    const line2 = new Row();
    line2.addElement(this.byID());
    line2.addElement(this.byLevel());
    list.addElement(line2);

    monsters
      .map((m) => this.monster(m, confirmBtn))
      .forEach((m) => list.addElement(m));

    return list;
  }

  protected confirmBtn(): DisplayObj {
    return new Button({
      name: "confirm",
      type: "normal",
      label: () => gameLabel("next"),
      disabled: () => !this.isCompleted(),
      onTap: () => {
        this.logger.info("Confirm");
        if (this.canvas)
          this.gameApp.getApp().stage.removeChild(this.canvas.getContainer());
        this.complete({ confirm: true, selected: this.selected });
      },
    });
  }
  protected cancelBtn(): DisplayObj {
    return new Button({
      name: "cancel",
      type: "normal",
      label: () => gameLabel("cancel"),
      disabled: () => false,
      onTap: () => {
        this.logger.info("cancel");
        if (this.canvas)
          this.gameApp.getApp().stage.removeChild(this.canvas.getContainer());
        this.complete({ confirm: false });
      },
    });
  }

  protected byID(): DisplayObj {
    return new Button({
      name: "BY_ID",
      type: "normal",
      label: () => gameLabel("sort-by-id"),
      disabled: () => false,
      onTap: () => {
        this.monsters.sort((a, b) => (a.modelId > b.modelId ? 1 : -1));
        const list = this.createList(this.monsters);
        if (this.canvas) {
          this.canvas.content = list;
          this.canvas?.update();
        }
      },
    });
  }

  protected byLevel(): DisplayObj {
    return new Button({
      name: "BY_LEVEL",
      type: "normal",
      label: () => gameLabel("sort-by-level"),
      disabled: () => false,
      onTap: () => {
        this.monsters.sort((a, b) => (a.level > b.level ? 1 : -1));
        const list = this.createList(this.monsters);
        if (this.canvas) {
          this.canvas.content = list;
          this.canvas?.update();
        }
      },
    });
  }

  protected monster(monster: Monster, confirmBtn: DisplayObj): DisplayObj {
    return new Button({
      name: monster.uuid,
      type: "text",
      label: (): string => {
        const selected = this.isSelected(monster);
        return `${selected ? "✔" : " "} ${monster.name}`;
      },
      disabled: () => false,
      onTap: () => {
        if (this.isSelected(monster)) {
          this.logger.info(`Deselect ${monster.name}`);
          const index = this.selected.indexOf(monster);
          this.selected.splice(index, 1);
        } else {
          this.logger.info(`Select ${monster.name}`);
          this.selected.push(monster);
        }
        confirmBtn.update();
      },
    });
  }

  protected isCompleted(): boolean {
    return this.min <= this.selected.length && this.selected.length <= this.max;
  }

  protected isSelected(monster: Monster): boolean {
    return this.selected.includes(monster);
  }
}
