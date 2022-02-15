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
import StringUtil from "@/utils/StringUtil";

export default class SelectMonsters extends Drawer {
  private logger = LoggerFactory.getLogger(
    "GameEngine.UI.MonsterSelection.SelectMonsters"
  );
  protected mapRepository = Container.get(MapRepository);
  protected gameApp = Container.get(GameApp);

  monsters;
  max;
  min;
  selected: Monster[] = [];
  canvas?: Canvas;

  sortBy?: "level" | "model";
  asc = false;

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
      this.canvas.scrollStep = this.getVisibleHeight() / 5;
      this.canvas.x = this.getX();
      this.canvas.y = this.getY();
      this.canvas.visibleWidth = this.getVisibleWidth();
      this.canvas.visibleHeight = this.getVisibleHeight();

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
    const line1 = new Row({ offsets: [0, 10] });
    line1.addElement(confirmBtn);
    line1.addElement(this.cancelBtn());
    list.addElement(line1);

    const line2 = new Row({ offsets: [0, 10] });
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
        this.sortMonsters("model");
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
        this.sortMonsters("level");
        const list = this.createList(this.monsters);
        if (this.canvas) {
          this.canvas.content = list;
          this.canvas?.update();
        }
      },
    });
  }

  protected sortMonsters(sortBy: "level" | "model"): void {
    if (this.sortBy === sortBy) {
      this.asc = !this.asc;
    } else {
      this.sortBy = sortBy;
      this.asc = true;
    }
    this.monsters.sort(this.getSortAlgorithm(this.sortBy));
    if (!this.asc) {
      this.monsters.reverse();
    }
  }

  protected getSortAlgorithm(
    sortBy: "level" | "model"
  ): (a: Monster, b: Monster) => number {
    if (sortBy === "level") {
      return (a, b) => {
        if (a.level !== b.level) {
          return a.level > b.level ? 1 : -1;
        }
        return a.uuid > b.uuid ? 1 : -1;
      };
    }
    if (sortBy === "model") {
      return (a, b) => {
        if (a.modelId !== b.modelId) {
          return a.modelId > b.modelId ? 1 : -1;
        }
        return a.uuid > b.uuid ? 1 : -1;
      };
    }
    throw Error(`Sort algorithm not available for ${sortBy}`);
  }

  protected monster(monster: Monster, confirmBtn: DisplayObj): DisplayObj {
    return new Button({
      name: monster.uuid,
      type: "text",
      label: (): string => {
        const selected = this.isSelected(monster);
        const id = monster.modelId;
        const name = monster.name;
        const level = `${monster.level}`;
        return `${selected ? "✔" : " "}${id} (${level}) ${name}`;
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

  protected getVisibleWidth(): number {
    if (this.screenProxy.isSmallScreen()) {
      return 0.9 * this.screenProxy.width();
    }
    return Math.min(600, 0.9 * this.screenProxy.width());
  }

  protected getVisibleHeight(): number {
    return Math.min(800, 0.9 * this.screenProxy.height());
  }

  protected getX(): number {
    return (this.screenProxy.width() - this.getVisibleWidth()) / 2;
  }
  protected getY(): number {
    return (this.screenProxy.height() - this.getVisibleHeight()) / 2;
  }
}
