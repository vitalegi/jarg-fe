import Monster from "@/game-engine/monster/Monster";
import LeftMenu, { MenuEntry } from "@/game-engine/ui/LeftMenu";
import { gameLabel } from "@/services/LocalizationService";

export default class SelectMonstersMenu {
  monsters;
  max;
  min;
  selected: Monster[] = [];

  public constructor(monsters: Monster[], max: number, min: number) {
    this.monsters = monsters;
    this.max = max;
    this.min = min;
  }

  public createMenu(
    onComplete: (selected: Monster[]) => void,
    onCancel: () => void
  ): LeftMenu {
    const menu = new LeftMenu();
    menu.addEntry(this.complete(menu, onComplete));
    menu.addEntry(this.cancel(menu, onCancel));
    this.monsters.forEach((m) => menu.addEntry(this.monster(menu, m)));

    return menu;
  }

  protected cancel(menu: LeftMenu, onCancel: () => void): MenuEntry {
    return MenuEntry.alwaysEnabled(gameLabel("cancel"), () => {
      menu.destroy();
      onCancel();
    });
  }

  protected complete(
    menu: LeftMenu,
    onComplete: (selected: Monster[]) => void
  ): MenuEntry {
    return new MenuEntry(
      gameLabel("next"),
      () => {
        menu.destroy();
        onComplete(this.selected);
      },
      () => this.isCompleted()
    );
  }

  protected monster(menu: LeftMenu, monster: Monster): MenuEntry {
    return new MenuEntry(
      `${monster.name}`,
      () => {
        this.selected.push(monster);
        menu.reDraw();
      },
      () => this.canSelect(monster)
    );
  }

  protected isCompleted(): boolean {
    return this.min <= this.selected.length && this.selected.length <= this.max;
  }

  protected canSelect(monster: Monster): boolean {
    if (this.selected.findIndex((m) => m.uuid === monster.uuid) !== -1) {
      return false;
    }
    if (this.selected.length === this.max) {
      return false;
    }
    return true;
  }
}
