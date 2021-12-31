import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import TurnManager from "../turns/TurnManager";
import MapContainer from "@/models/Map";
import WindowSizeProxy from "../WindowSizeProxy";

export default class TurnBoxDrawer extends Drawer {
  protected static NAME = "TurnBox";

  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected windowSizeProxy = Container.get<WindowSizeProxy>(WindowSizeProxy);
  protected map: MapContainer;

  protected turns: string[] = [];

  options = {
    entries: 10,
    style: {
      width: 120,
      y: 4,
      rightMargin: 4,
      font: {
        fontFamily: "Courier",
        fontSize: 14,
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      },
      menuEntry: {
        height: 20,
        fill: 0xffffff,
        marginLeft: 1,
      },
    },
  };

  public constructor(parent: PIXI.Container, map: MapContainer) {
    super();
    this.parent = parent;
    this.map = map;
  }

  protected getName(): string {
    return "TurnBoxDrawer";
  }

  public doDraw(): void {
    const newTurns = this.getTurns();
    if (this.container === null) {
      this.container = new PIXI.Container();
      this.container.name = TurnBoxDrawer.NAME;
      this.parent.addChild(this.container);
      this.container.x = this.x();
      this.container.y = this.options.style.y;
    }
    if (this.container.x !== this.x()) {
      this.container.x = this.x();
    }
    if (this.container.y !== this.options.style.y) {
      this.container.y = this.options.style.y;
    }

    if (!this.turnsChanged(this.turns, newTurns)) {
      return;
    }
    this.container.height = this.height(newTurns);
    console.log(`Turns have changed from ${this.turns} to ${newTurns}`);
    // regenerate entries
    this.turns = newTurns;
    this.turns
      .map((id: string, index: number) => this.createTurnEntry(id, index))
      .forEach((turn) => this.container?.addChild(turn));
  }

  protected createTurnEntry(id: string, index: number): PIXI.DisplayObject {
    const monster = this.map.monsters.find((m) => m.uuid === id);
    let label = "unknown";
    if (monster !== undefined) {
      label = monster.name;
    }

    const entry = new PIXI.Text(label, this.options.style.font);
    entry.x = this.options.style.menuEntry.marginLeft;
    entry.y = this.options.style.menuEntry.height * index;
    return entry;
  }
  protected x(): number {
    return (
      this.windowSizeProxy.width() -
      this.options.style.rightMargin -
      this.options.style.width
    );
  }

  protected getTurns(): string[] {
    return this.turnManager.getTurns(10);
  }

  protected turnsChanged(oldTurns: string[], newTurns: string[]): boolean {
    if (oldTurns.length !== newTurns.length) {
      return true;
    }
    for (let i = 0; i < oldTurns.length; i++) {
      if (oldTurns[i] !== newTurns[i]) {
        return true;
      }
    }
    return false;
  }

  protected height(turns: string[]): number {
    return this.options.style.menuEntry.height * turns.length;
  }
}
