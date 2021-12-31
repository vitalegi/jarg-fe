import Container from "typedi";
import Drawer from "./Drawer";
import * as PIXI from "pixi.js";
import TurnManager from "../turns/TurnManager";
import FrameImpl from "./FrameImpl";
import MapContainer from "@/models/Map";

export default class TurnBoxDrawer extends Drawer {
  protected static NAME = "TurnBox";

  protected app: PIXI.Application;
  protected parent: PIXI.Container;
  protected container: PIXI.Container | null = null;
  protected turnManager = Container.get<TurnManager>(TurnManager);
  protected map: MapContainer;
  protected frame = new FrameImpl();

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

  public constructor(
    app: PIXI.Application,
    parent: PIXI.Container,
    map: MapContainer
  ) {
    super();
    this.app = app;
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
    // remove existing turns entries
    this.container.children
      .filter((c) => c.name !== this.frame.getName())
      .forEach((c) => this.container?.removeChild(c));

    // add entries
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
    entry.x = this.frame.getWidth() + this.options.style.menuEntry.marginLeft;
    entry.y =
      this.frame.getWidth() + this.options.style.menuEntry.height * index;
    return entry;
  }
  protected x(): number {
    return (
      this.app.view.width -
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
