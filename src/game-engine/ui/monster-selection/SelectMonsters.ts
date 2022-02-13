import Monster from "@/game-engine/model/monster/Monster";
import Button from "@/game-engine/ui/graphics/Button";
import DisplayObj from "@/game-engine/ui/graphics/DisplayObj";
import List from "@/game-engine/ui/graphics/List";
import LoggerFactory from "@/logger/LoggerFactory";
import { gameLabel } from "@/services/LocalizationService";
import * as PIXI from "pixi.js";

export default class SelectMonsters extends List {
  private logger2 = LoggerFactory.getLogger(
    "GameEngine.UI.MonsterSelection.SelectMonsters"
  );

  monsters;
  max;
  min;
  selected: Monster[] = [];

  public constructor(monsters: Monster[], max: number, min: number) {
    super();
    this.monsters = monsters;
    this.max = max;
    this.min = min;
    this.x = 10;
    this.y = 10;
    this.visibleWidth = 250;
    this.visibleHeight = 280;
    const confirmBtn = this.confirmBtn();
    this.addElement(confirmBtn);
    this.addElement(this.cancelBtn());
    for (let i = 0; i < 20; i++) {
      monsters
        .map((m) => this.monster(m, confirmBtn))
        .forEach((m) => this.addElement(m));
    }
  }

  protected getContentName(): string {
    return "SELECT_MONSTERS";
  }

  protected confirmBtn(): DisplayObj {
    return new Button({
      name: "confirm",
      label: () => gameLabel("next"),
      disabled: () => {
        return !this.isCompleted();
      },
      onTap: () => {
        this.logger2.info("Confirm");
        this.gameApp.getApp().stage.removeChild(this.getContainer());
        this.complete({ confirm: true, selected: this.selected });
      },
    });
  }
  protected cancelBtn(): DisplayObj {
    return new Button({
      name: "cancel",
      label: () => gameLabel("cancel"),
      disabled: () => false,
      onTap: () => {
        this.logger2.info("cancel");
        this.gameApp.getApp().stage.removeChild(this.getContainer());
        this.complete({ confirm: false });
      },
    });
  }

  protected monster(monster: Monster, confirmBtn: DisplayObj): DisplayObj {
    return new Button({
      name: monster.name,
      label: (): string => {
        const selected = this.isSelected(monster);
        return `[${selected ? "x" : " "}] ${monster.name}`;
      },
      disabled: () => false,
      onTap: () => {
        if (this.isSelected(monster)) {
          this.logger2.info(`Deselect ${monster.name}`);
          const index = this.selected.indexOf(monster);
          this.selected.splice(index, 1);
        } else {
          this.logger2.info(`Select ${monster.name}`);
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
